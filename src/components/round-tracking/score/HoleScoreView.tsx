
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
  
  // Log critical information for debugging
  useEffect(() => {
    console.log(`HoleScoreView mounted - Current hole: ${currentHole}/${holeCount}`);
    console.log(`HoleScoreView - isLast prop value: ${isLast}`);
    console.log(`HoleScoreView - URL path: ${window.location.pathname}`);
    
    // Check session storage for hole count
    const sessionHoleCount = sessionStorage.getItem('current-hole-count');
    console.log(`HoleScoreView - Session storage hole count: ${sessionHoleCount}`);
    
    // Validate URL path for 9-hole vs 18-hole
    const path = window.location.pathname;
    const is9HolePath = /\/rounds\/new\/9($|\/)/.test(path);
    const is18HolePath = /\/rounds\/new\/18($|\/)/.test(path);
    console.log(`HoleScoreView - Path analysis: is9HolePath=${is9HolePath}, is18HolePath=${is18HolePath}`);
  }, [currentHole, holeCount, isLast]);
  
  const handleReviewRound = useCallback(() => {
    console.log(`Review Round button clicked at hole ${currentHole}/${holeCount}`);
    
    // Use the onFinish prop if provided, otherwise show the final scorecard
    if (onFinish) {
      onFinish();
    } else {
      setShowFinalScore(true);
    }
  }, [onFinish, currentHole, holeCount]);
  
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
        holeScores={holeScores.slice(0, holeCount)}
        isOpen={true}
        onConfirm={() => {}} // This will be connected to submit functionality
        onCancel={handleCancelReview}
        holeCount={holeCount}
      />
    );
  }
  
  // Determine if this is the first hole based on the hole number
  const isFirstHole = currentHole === 1;
  
  // Calculate if this is the last hole based on the hole count
  // This is a simple equality check that's reliable
  const isLastHole = currentHole === holeCount;
  
  // Use the explicit isLast prop or fall back to calculated isLastHole
  const effectiveIsLast = isLast || isLastHole;
  
  console.log(`HoleScoreView - Final calculation:
  - isFirstHole: ${isFirstHole}
  - isLastHole (calculated): ${isLastHole}
  - isLast (prop): ${isLast}
  - effectiveIsLast: ${effectiveIsLast}
  - holeCount: ${holeCount}
  - currentHole: ${currentHole}`);
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ScoreSummary holeScores={holeScores} />
      
      <HoleScoreCard
        holeData={currentHoleData}
        onUpdate={handleHoleUpdate}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onReviewRound={handleReviewRound}
        isFirst={isFirstHole}
        isLast={effectiveIsLast}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        saveError={saveError}
        currentHole={currentHole}
        holeCount={holeCount}
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
