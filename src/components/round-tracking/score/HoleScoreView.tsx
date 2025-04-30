import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import type { HoleData } from "@/types/round-tracking";
import { useMemo } from "react";
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
  console.log("HoleScoreView rendered with navigation handlers:", { 
    hasNextHandler: !!handleNext,
    hasPrevHandler: !!handlePrevious,
    currentHole, 
    holeCount
  });
  
  // Ensure we have valid hole data that matches the current hole
  const validatedHoleData = useMemo(() => {
    if (isLoading) {
      console.log("Skipping hole data validation due to loading state");
      return null;
    }
    
    // If the currentHoleData matches the current hole, use it
    if (currentHoleData && currentHoleData.holeNumber === currentHole) {
      console.log("Using provided currentHoleData for hole:", currentHole);
      return currentHoleData;
    }
    
    // Otherwise, try to find the hole in the scores array
    const matchingHole = holeScores.find(hole => hole.holeNumber === currentHole);
    if (matchingHole) {
      console.log("Found matching hole in scores for hole:", currentHole);
      return matchingHole;
    }
    
    // If all else fails, create a default hole
    console.log("Creating default hole data for:", currentHole);
    return {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
  }, [currentHoleData, currentHole, holeScores, isLoading]);
    
  if (isLoading || !validatedHoleData) {
    console.log("Showing HoleScoreViewSkeleton due to loading or missing data");
    return <HoleScoreViewSkeleton />;
  }
  
  // Direct pass-through of navigation handlers with consistent function names
  const handlePreviousWrapped = () => {
    console.log(`Previous clicked in HoleScoreView for hole ${currentHole}, calling parent handler`);
    handlePrevious();
  };
  
  const handleNextWrapped = () => {
    console.log(`Next clicked in HoleScoreView for hole ${currentHole}, calling parent handler`);
    handleNext();
  };
  
  return (
    <>
      {holeScores.length > 0 && (
        <ScoreSummary holeScores={holeScores.slice(0, holeCount)} />
      )}
      
      <HoleScoreCard
        holeData={validatedHoleData}
        onUpdate={handleHoleUpdate}
        onNext={handleNextWrapped}
        onPrevious={handlePreviousWrapped}
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
