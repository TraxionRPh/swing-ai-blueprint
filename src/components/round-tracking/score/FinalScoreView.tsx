
import { useState } from "react";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
import type { HoleData } from "@/types/round-tracking";

interface FinalScoreViewProps {
  holeScores: HoleData[];
  holeCount: number;
  finishRound: (holeCount: number) => Promise<boolean>;
  onBack: () => void;
}

export const FinalScoreView = ({
  holeScores,
  holeCount,
  finishRound,
  onBack
}: FinalScoreViewProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  
  const handleConfirmRound = async () => {
    const success = await finishRound(holeCount);
    setShowFinalScore(false);
    
    if (success) {
      onBack();
    }
  };
  
  return (
    <FinalScoreCard
      holeScores={holeScores.slice(0, holeCount)}
      isOpen={showFinalScore}
      onConfirm={handleConfirmRound}
      onCancel={() => setShowFinalScore(false)}
      holeCount={holeCount}
    />
  );
};
