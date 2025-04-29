
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
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
  // Add extra check to ensure currentHoleData matches current hole
  const validatedHoleData = 
    currentHoleData.holeNumber === currentHole ? 
    currentHoleData : 
    {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
  
  return (
    <>
      {holeScores.length > 0 && (
        <ScoreSummary holeScores={holeScores.slice(0, holeCount)} />
      )}
      
      <HoleScoreCard
        holeData={validatedHoleData}
        onUpdate={onHoleUpdate}
        onNext={onNext}
        onPrevious={onPrevious}
        isFirst={currentHole === 1}
        isLast={currentHole === holeCount}
        teeColor={teeColor}
        courseId={courseId}
        isSaving={isSaving}
      />

      <FinalScoreCard
        holeScores={holeScores.slice(0, holeCount)}
        isOpen={showFinalScore}
        onConfirm={onConfirmRound}
        onCancel={onCancelFinalScore}
        holeCount={holeCount}
      />
    </>
  );
};
