
import { useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import { HoleData } from "@/types/round-tracking";

export const useRoundFinalization = (
  baseFinishRound: (holeScores: HoleData[], holeCount: number) => Promise<boolean>,
  holeScores: HoleData[]
) => {
  const { scoreGoal } = useProfile();
  
  const finishRound = useCallback(async (holeCount: number | null) => {
    if (!holeCount) return false;
    
    // Calculate total score before finishing the round
    const relevantScores = holeScores.slice(0, holeCount);
    const totalScore = relevantScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
    
    // Log goal checking for debugging
    if (scoreGoal) {
      console.log(`Checking score goal: ${totalScore} vs goal of ${scoreGoal}`);
    }
    
    return baseFinishRound(holeScores.slice(0, holeCount), holeCount);
  }, [baseFinishRound, holeScores, scoreGoal]);

  return { finishRound };
};
