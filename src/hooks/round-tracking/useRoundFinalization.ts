
import { useCallback, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { HoleData } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";

export const useRoundFinalization = (
  baseFinishRound: (holeScores: HoleData[], holeCount: number) => Promise<boolean>,
  holeScores: HoleData[]
) => {
  const { scoreGoal } = useProfile();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const finishRound = useCallback(async (holeCount: number) => {
    if (isSubmitting) {
      console.log("Already submitting round, ignoring duplicate request");
      return false;
    }
    
    // Get the hole count from parameter or session storage as fallback
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    const actualHoleCount = holeCount || (storedHoleCount ? parseInt(storedHoleCount) : 18);
    
    console.log(`Finishing round with hole count: ${actualHoleCount}, scores available: ${holeScores.length}`);
    
    // Calculate total score before finishing the round
    const relevantScores = holeScores.slice(0, actualHoleCount);
    const totalScore = relevantScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
    
    // Log goal checking and total score for debugging
    console.log(`Finishing round with total score: ${totalScore}, hole count: ${actualHoleCount}`);
    if (scoreGoal) {
      console.log(`Checking score goal: ${totalScore} vs goal of ${scoreGoal}`);
    }
    
    // Prepare data for saving - ensure all values are in the correct format
    const preparedScores = relevantScores.map(hole => ({
      ...hole,
      score: hole.score || 0,
      // Important fix: ensure putts is always a number (0) if undefined
      putts: typeof hole.putts === 'number' ? hole.putts : 0,
      fairwayHit: !!hole.fairwayHit,
      greenInRegulation: !!hole.greenInRegulation
    }));
    
    console.log(`Prepared ${preparedScores.length} scores for submission with hole count ${actualHoleCount}`);
    
    // Save all hole scores before finishing the round
    try {
      setIsSubmitting(true);
      return await baseFinishRound(preparedScores, actualHoleCount);
    } catch (error) {
      console.error("Error finishing round:", error);
      toast({
        title: "Error saving round",
        description: "Could not save your round data. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [baseFinishRound, holeScores, scoreGoal, toast, isSubmitting]);

  return { finishRound, isSubmitting };
};
