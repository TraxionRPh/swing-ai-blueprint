
import React from "react";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import type { HoleData } from "@/types/round-tracking";

interface RoundReviewProps {
  holeScores: HoleData[];
  holeCount: number;
  finishRound: (holeCount: number) => Promise<boolean>;
  onBack: () => void;
}

export const RoundReview: React.FC<RoundReviewProps> = ({
  holeScores,
  holeCount,
  finishRound,
  onBack
}) => {
  return (
    <FinalScoreView
      holeScores={holeScores}
      holeCount={holeCount}
      finishRound={finishRound}
      onBack={onBack}
    />
  );
};
