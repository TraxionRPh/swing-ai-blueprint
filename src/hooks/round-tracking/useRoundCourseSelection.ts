import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Course, HoleData } from "@/types/round-tracking";

export const useRoundCourseSelection = (
  handleCourseSelectBase: (course: Course, holeCount: number) => Promise<string | null>,
  setCurrentRoundId: (id: string | null) => void,
  setHoleScores: (scores: HoleData[]) => void,
  holeCount: number | null,
  createNewRoundCallback?: (courseId: string, holeCount: number) => Promise<string | null>
) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCourseSelect = useCallback(async (course: Course) => {
    try {
      // We always want to use the holeCount that's already been set or default to 18
      const countToUse = holeCount || 18;
      
      // If we have a specific callback for new round creation, use that
      let newRoundId = null;
      if (createNewRoundCallback) {
        newRoundId = await createNewRoundCallback(course.id, countToUse);
        if (newRoundId) {
          console.log("Created new round with ID:", newRoundId);
          
          // Navigate to the new round detail page
          navigate(`/rounds/${newRoundId}`);
          return newRoundId;
        }
      }
      
      // Otherwise use the base course select handler
      newRoundId = await handleCourseSelectBase(course, countToUse);
      if (newRoundId) {
        setCurrentRoundId(newRoundId);
        
        // Create default holes based on the selected hole count
        const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: 4,
          distance: 0,
          score: 0,
          putts: 0,
          fairwayHit: false,
          greenInRegulation: false
        }));
        setHoleScores(defaultHoles);
        
        // Navigate to the new round detail page
        navigate(`/rounds/${newRoundId}`);
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
  }, [handleCourseSelectBase, setCurrentRoundId, setHoleScores, holeCount, toast, createNewRoundCallback, navigate]);

  return { handleCourseSelect };
};
