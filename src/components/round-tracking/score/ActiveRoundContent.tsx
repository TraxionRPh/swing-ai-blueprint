import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
import { HoleScoreView } from "./HoleScoreView";
import { FinalScoreView } from "./FinalScoreView";
import type { HoleData } from "@/types/round-tracking";

interface ActiveRoundContentProps {
  holeScores: HoleData[];
  currentHoleData: HoleData;
  onHoleUpdate: (data: HoleData) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentHole: number;
  holeCount: number;
  teeColor?: string;
  courseId?: string;
  isSaving: boolean;
  showFinalScore: boolean;
  onConfirmRound: () => void;
  onCancelFinalScore: () => void;
}

// This component is now deprecated and split into HoleScoreView and FinalScoreView
// Keeping it temporarily for backward compatibility
export const ActiveRoundContent = ({
  holeScores,
  currentHoleData,
  onHoleUpdate,
  onNext,
  onPrevious,
  currentHole,
  holeCount,
  teeColor,
  courseId,
  isSaving,
  showFinalScore,
  onConfirmRound,
  onCancelFinalScore
}: ActiveRoundContentProps) => {
  return showFinalScore ? (
    <FinalScoreCard 
      holeScores={holeScores.slice(0, holeCount)}
      isOpen={showFinalScore}
      onConfirm={onConfirmRound}
      onCancel={onCancelFinalScore}
      holeCount={holeCount}
    />
  ) : (
    <HoleScoreView
      currentHoleData={currentHoleData}
      handleHoleUpdate={onHoleUpdate}
      handleNext={onNext}
      handlePrevious={onPrevious}
      currentHole={currentHole}
      holeCount={holeCount}
      isSaving={isSaving}
      teeColor={teeColor}
      courseId={courseId}
      holeScores={holeScores}
    />
  );
};
