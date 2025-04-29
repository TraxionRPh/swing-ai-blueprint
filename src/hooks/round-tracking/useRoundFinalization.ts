
import { useCallback } from "react";
import { HoleData } from "@/types/round-tracking";

export const useRoundFinalization = (
  baseFinishRound: (holeScores: HoleData[], holeCount: number) => Promise<boolean>,
  holeScores: HoleData[]
) => {
  const finishRound = useCallback(async (holeCount: number | null) => {
    if (!holeCount) return false;
    return baseFinishRound(holeScores.slice(0, holeCount), holeCount);
  }, [baseFinishRound, holeScores]);

  return { finishRound };
};
