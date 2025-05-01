
import { useCallback } from "react";
import { HoleScoreCard } from "@/components/round-tracking/hole-score/HoleScoreCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreViewProps {
  currentHoleData: HoleData;
  handleHoleUpdate: (data: HoleData) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  currentHole: number;
  holeCount: number;
  isSaving: boolean;
  isLoading?: boolean;
  teeColor?: string;
  courseId?: string;
  holeScores?: HoleData[];
}

export const HoleScoreView = ({
  currentHoleData,
  handleHoleUpdate,
  handleNext,
  handlePrevious,
  currentHole,
  holeCount,
  isSaving,
  isLoading = false,
  teeColor,
  courseId,
  holeScores = []
}: HoleScoreViewProps) => {
  console.log("HoleScoreView rendered with current hole:", currentHole, "out of", holeCount);
    
  // Enhanced navigation handlers with useCallback to prevent unnecessary re-renders
  const handleNextHole = useCallback(() => {
    console.log(`Next clicked in HoleScoreView for hole ${currentHole}`);
    handleNext();
  }, [handleNext, currentHole]);
  
  const handlePreviousHole = useCallback(() => {
    console.log(`Previous clicked in HoleScoreView for hole ${currentHole}`);
    handlePrevious();
  }, [handlePrevious, currentHole]);
  
  if (isLoading) {
    return <HoleScoreViewSkeleton />;
  }
  
  return (
    <div className="space-y-6">
      {/* Add score summary at the top */}
      <ScoreSummary holeScores={holeScores} />
      
      <HoleScoreCard
        holeData={currentHoleData}
        onUpdate={handleHoleUpdate}
        onNext={handleNextHole}
        onPrevious={handlePreviousHole}
        isFirst={currentHole === 1}
        isLast={currentHole === holeCount}
        isSaving={isSaving}
        currentHole={currentHole}
        holeCount={holeCount}
        teeColor={teeColor}
        courseId={courseId}
      />
    </div>
  );
};

const HoleScoreViewSkeleton = () => (
  <div className="w-full max-w-xl mx-auto">
    <Skeleton className="w-full h-80" />
  </div>
);
