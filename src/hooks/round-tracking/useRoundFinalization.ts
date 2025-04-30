
import { useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import { HoleData } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";

export const useRoundFinalization = (
  baseFinishRound: (holeScores: HoleData[], holeCount: number) => Promise<boolean>,
  holeScores: HoleData[]
) => {
  const { scoreGoal } = useProfile();
  const { toast } = useToast();
  
  const finishRound = useCallback(async (holeCount: number | null) => {
    if (!holeCount) return false;
    
    // Calculate total score before finishing the round
    const relevantScores = holeScores.slice(0, holeCount);
    const totalScore = relevantScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
    
    // Log goal checking and total score for debugging
    console.log(`Finishing round with total score: ${totalScore}`);
    if (scoreGoal) {
      console.log(`Checking score goal: ${totalScore} vs goal of ${scoreGoal}`);
    }
    
    // Save all hole scores before finishing the round
    try {
      return await baseFinishRound(holeScores.slice(0, holeCount), holeCount);
    } catch (error) {
      console.error("Error finishing round:", error);
      toast({
        title: "Error saving round",
        description: "Could not save your round data. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [baseFinishRound, holeScores, scoreGoal, toast]);

  return { finishRound };
};
