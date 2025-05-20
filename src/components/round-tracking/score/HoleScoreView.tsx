
import { useCallback, useState, useEffect } from "react";
import { HoleScoreCard } from "@/components/round-tracking/hole-score/HoleScoreCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
import type { HoleData } from "@/types/round-tracking";

export interface HoleScoreViewProps {
  currentHoleData: HoleData;
  handleHoleUpdate: (data: HoleData) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  currentHole: number;
  holeCount: number;
  isSaving: boolean;
  saveSuccess?: boolean;
  saveError?: string | null;
  isLoading?: boolean;
  teeColor?: string;
  courseId?: string;
  teeId?: string;
  holeScores?: HoleData[];
  onFinish?: () => void;
  isLast?: boolean;
}

export const HoleScoreView = ({
  currentHoleData,
  handleHoleUpdate,
  handleNext,
  handlePrevious,
  currentHole,
  holeCount,
  isSaving,
  saveSuccess = false,
  saveError = null,
  isLoading = false,
  teeColor,
  courseId,
  teeId,
  holeScores = [],
  onFinish,
  isLast = false
}: HoleScoreViewProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [actualHoleCount, setActualHoleCount] = useState(holeCount);
  
  // Sync with session storage on mount and when holeCount changes
  useEffect(() => {
    const sessionHoleCount = sessionStorage.getItem('current-hole-count');
    if (sessionHoleCount) {
      const parsedCount = parseInt(sessionHoleCount, 10);
      setActualHoleCount(parsedCount);
      console.log(`HoleScoreView: Updated actual hole count from session: ${parsedCount} (prop value: ${holeCount})`);
    } else {
      setActualHoleCount(holeCount);
      console.log(`HoleScoreView: Using prop hole count: ${holeCount} (no session value)`);
    }
  }, [holeCount]);
  
  // Log critical information for debugging on every render
  console.log(`HoleScoreView rendered - Hole: ${currentHole}/${actualHoleCount}, isLast: ${isLast}`);
  console.log(`Is 9-hole round? ${actualHoleCount === 9}`);
  
  // Enhanced navigation handlers with useCallback to prevent unnecessary re-renders
  const handleNextHole = useCallback(() => {
    console.log(`Next clicked in HoleScoreView for hole ${currentHole}/${actualHoleCount}`);
    handleNext();
  }, [handleNext, currentHole, actualHoleCount]);
  
  const handlePreviousHole = useCallback(() => {
    console.log(`Previous clicked in HoleScoreView for hole ${currentHole}`);
    handlePrevious();
  }, [handlePrevious, currentHole]);
  
  const handleReviewRound = useCallback(() => {
    console.log(`Review Round button clicked at hole ${currentHole}/${actualHoleCount}`);
    
    // Use the onFinish prop if provided, otherwise show the final scorecard
    if (onFinish) {
      onFinish();
    } else {
      setShowFinalScore(true);
    }
  }, [onFinish, currentHole, actualHoleCount]);
  
  const handleCancelReview = useCallback(() => {
    console.log("Cancelling review, returning to hole view");
    setShowFinalScore(false);
  }, []);
  
  if (isLoading) {
    return <HoleScoreViewSkeleton />;
  }
  
  if (showFinalScore) {
    return (
      <FinalScoreCard
        holeScores={holeScores.slice(0, actualHoleCount)}
        isOpen={true}
        onConfirm={() => {}} // This will be connected to submit functionality
        onCancel={handleCancelReview}
        holeCount={actualHoleCount}
      />
    );
  }
  
  // Determine if this is the first hole based on the hole number
  const isFirstHole = currentHole === 1;
  
  // Calculate if this is the last hole based on the actual hole count from session/props
  const isLastHole = currentHole === actualHoleCount;
  const effectiveIsLast = isLast || isLastHole;
  
  // Explicitly log all conditions for debugging purposes
  console.log(`HoleScoreView status check - Hole: ${currentHole}/${actualHoleCount}`);
  console.log(`- isFirstHole: ${isFirstHole}`);
  console.log(`- isLast prop: ${isLast}`);
  console.log(`- isLastHole (calculated): ${isLastHole}`);
  console.log(`- effectiveIsLast: ${effectiveIsLast}`);
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ScoreSummary holeScores={holeScores} />
      
      <HoleScoreCard
        holeData={currentHoleData}
        onUpdate={handleHoleUpdate}
        onNext={handleNextHole}
        onPrevious={handlePreviousHole}
        onReviewRound={handleReviewRound}
        isFirst={isFirstHole}
        isLast={effectiveIsLast}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        saveError={saveError}
        currentHole={currentHole}
        holeCount={actualHoleCount}
        teeColor={teeColor}
        courseId={courseId}
        teeId={teeId}
      />
    </div>
  );
};

const HoleScoreViewSkeleton = () => (
  <div className="w-full max-w-xl mx-auto">
    <Skeleton className="w-full h-80" />
  </div>
);
