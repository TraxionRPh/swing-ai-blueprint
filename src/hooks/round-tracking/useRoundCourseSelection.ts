
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Course, HoleData } from "@/types/round-tracking";

export const useRoundCourseSelection = (
  handleCourseSelectBase: (course: Course, holeCount: number) => Promise<string | null>,
  setCurrentRoundId: (id: string | null) => void,
  setHoleScores: (scores: HoleData[]) => void,
  holeCount: number | null
) => {
  const { toast } = useToast();

  const handleCourseSelect = useCallback(async (course: Course) => {
    try {
      console.log(`Creating round for course ${course.name} (ID: ${course.id}) with ${course.course_holes?.length || 0} holes data`);
      
      // Determine the hole count based on available data or default to 18
      const actualHoleCount = holeCount || (course.course_holes?.length || 18);
      console.log(`Using hole count: ${actualHoleCount}`);
      
      // Create a new round with the selected course
      const newRoundId = await handleCourseSelectBase(course, actualHoleCount);
      
      if (newRoundId) {
        setCurrentRoundId(newRoundId);
        
        // Create default holes based on the course information
        const defaultHoles = Array.from({ length: actualHoleCount }, (_, i) => {
          // Find corresponding course hole data
          const holeNumber = i + 1;
          const courseHoleData = course.course_holes?.find(h => h.hole_number === holeNumber);
          
          if (courseHoleData) {
            console.log(`Using hole data for hole ${holeNumber}: par ${courseHoleData.par}, distance ${courseHoleData.distance_yards}yd`);
          }
          
          return {
            holeNumber: holeNumber,
            // Use actual course data when available
            par: courseHoleData?.par || 
                (course.total_par ? Math.round(course.total_par / actualHoleCount) : 4),
            distance: courseHoleData?.distance_yards || 0,
            score: 0,
            putts: 0,
            fairwayHit: false,
            greenInRegulation: false
          };
        });
        
        setHoleScores(defaultHoles);
        console.log(`Created ${defaultHoles.length} holes with course data`);
        console.log(`Sample hole data - Hole 1: par ${defaultHoles[0]?.par}, distance ${defaultHoles[0]?.distance}`);
      } else {
        console.error("Failed to create new round ID");
      }
      
      return newRoundId;
    } catch (error) {
      console.error("Error selecting course:", error);
      toast({
        title: "Error selecting course",
        description: "Could not create a new round. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [handleCourseSelectBase, setCurrentRoundId, setHoleScores, holeCount, toast]);

  return { handleCourseSelect };
};
