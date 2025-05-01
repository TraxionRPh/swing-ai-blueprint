
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
      // We always want to use the holeCount that's already been set
      const newRoundId = await handleCourseSelectBase(course, holeCount || 18);
      if (newRoundId) {
        setCurrentRoundId(newRoundId);
        
        // Create default holes based on the course information if available
        const defaultHoles = Array.from({ length: holeCount || 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: course.total_par ? Math.round((course.total_par || 72) / 18) : 4, // Use course par if available
          distance: 0, // Will be populated from course data later
          score: 0,
          putts: 0,
          fairwayHit: false,
          greenInRegulation: false
        }));
        
        setHoleScores(defaultHoles);
        
        // Log successful course selection
        console.log(`Course selected: ${course.name}, created round ID: ${newRoundId}`);
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
