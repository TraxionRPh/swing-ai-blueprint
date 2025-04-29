
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import type { HoleData } from "@/types/round-tracking";
import { useEffect, memo } from "react";

interface HoleScoreViewProps {
  currentHoleData: HoleData;
  handleHoleUpdate: (data: HoleData) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  currentHole: number;
  holeCount: number;
  teeColor?: string;
  courseId?: string;
  isSaving: boolean;
  holeScores: HoleData[];
}

export const HoleScoreView = memo(({
  currentHoleData,
  handleHoleUpdate,
  handleNext,
  handlePrevious,
  currentHole,
  holeCount,
  teeColor,
  courseId,
  isSaving,
  holeScores
}: HoleScoreViewProps) => {
  // Make sure we have a valid hole data object that matches the current hole
  const validatedHoleData = 
    currentHoleData && currentHoleData.holeNumber === currentHole ? 
    currentHoleData : 
    holeScores.find(hole => hole.holeNumber === currentHole) || {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
  
  // Log hole scores for debugging
  console.log("HoleScoreView rendering with hole scores:", 
    holeScores.length > 0 ? 
    `${holeScores.length} holes, current hole: ${currentHole}` : 
    "No hole scores available");
  
  return (
    <>
      {holeScores.length > 0 && (
        <ScoreSummary holeScores={holeScores.slice(0, holeCount)} />
      )}
      
      <HoleScoreCard
        holeData={validatedHoleData}
        onUpdate={handleHoleUpdate}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={currentHole === 1}
        isLast={currentHole === holeCount}
        teeColor={teeColor}
        courseId={courseId}
        isSaving={isSaving}
      />
    </>
  );
});

HoleScoreView.displayName = 'HoleScoreView';
