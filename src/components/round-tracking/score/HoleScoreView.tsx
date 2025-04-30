
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import type { HoleData } from "@/types/round-tracking";
import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
  isLoading?: boolean;
}

export const HoleScoreView = ({
  currentHoleData,
  handleHoleUpdate,
  handleNext,
  handlePrevious,
  currentHole,
  holeCount,
  teeColor,
  courseId,
  isSaving,
  holeScores,
  isLoading = false
}: HoleScoreViewProps) => {
  // Make sure we have a valid hole data object that matches the current hole
  const validatedHoleData = useMemo(() => {
    if (currentHoleData && currentHoleData.holeNumber === currentHole) {
      return currentHoleData;
    }
    
    const matchingHole = holeScores.find(hole => hole.holeNumber === currentHole);
    if (matchingHole) {
      return matchingHole;
    }
    
    // Default hole data if nothing matches
    return {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
  }, [currentHoleData, currentHole, holeScores]);
  
  // Log current hole data to help with debugging
  useEffect(() => {
    console.log(`HoleScoreView - Displaying hole ${currentHole}`, validatedHoleData);
  }, [currentHole, validatedHoleData]);
    
  if (isLoading) {
    return <HoleScoreViewSkeleton />;
  }
  
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
};

const HoleScoreViewSkeleton = () => (
  <>
    <div className="mb-6">
      <Skeleton className="w-full h-20" />
    </div>
    <div className="w-full max-w-xl mx-auto">
      <Skeleton className="w-full h-80" />
    </div>
  </>
);
