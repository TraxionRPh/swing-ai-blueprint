
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
  
  // Enhanced logging for debugging
  useEffect(() => {
    // URL-based validation for isLast
    const path = window.location.pathname;
    const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
    const urlBasedIsLast = (is9HoleRound && currentHole === 9) || (!is9HoleRound && currentHole === holeCount);

    console.log(`HoleScoreView mounted - Current hole: ${currentHole}/${holeCount}`);
    console.log(`HoleScoreView - isLast prop value: ${isLast}`);
    console.log(`HoleScoreView - URL-based isLast calculation: ${urlBasedIsLast}`);
    console.log(`HoleScoreView - URL path: ${window.location.pathname}`);
    
    // Verify hole count from session storage matches props
    const sessionHoleCount = sessionStorage.getItem('current-hole-count');
    console.log(`HoleScoreView - Session storage hole count: ${sessionHoleCount}`);
    console.log(`HoleScoreView - Props hole count: ${holeCount}`);
    
    // Validate that the session storage and props are in sync
    if (sessionHoleCount) {
      const parsedSessionCount = parseInt(sessionHoleCount, 10);
      if (parsedSessionCount !== holeCount) {
        console.warn(`Warning: Session storage hole count (${parsedSessionCount}) doesn't match props hole count (${holeCount})`);
        
        // For 9-hole rounds, ensure session storage is correct
        if (is9HoleRound && parsedSessionCount !== 9) {
          console.log("Auto-correcting session storage for 9-hole round");
          sessionStorage.setItem('current-hole-count', '9');
        }
      }
    }

    // Force-set session storage based on URL if needed
    if (is9HoleRound && sessionHoleCount !== '9') {
      console.log("URL indicates 9-hole round, updating session storage");
      sessionStorage.setItem('current-hole-count', '9');
    }
  }, [currentHole, holeCount, isLast]);
  
  const handleReviewRound = useCallback(() => {
    console.log(`Review Round button clicked at hole ${currentHole}/${holeCount}`);
    
    // Make sure hole count is set in session storage before review
    sessionStorage.setItem('current-hole-count', holeCount.toString());
    
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
  
  // URL-based validation for isLast as a double-check
  const path = window.location.pathname;
  const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
  const urlBasedIsLast = (is9HoleRound && currentHole === 9) || (!is9HoleRound && currentHole === holeCount);
  
  // Final isLast determination using both prop and URL validation
  const finalIsLast = isLast === true || urlBasedIsLast;
  
  console.log(`HoleScoreView - Final calculation:
  - isFirstHole: ${isFirstHole}
  - isLast (prop): ${isLast}
  - URL-based isLast: ${urlBasedIsLast}
  - Final isLast: ${finalIsLast}
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
        isLast={finalIsLast}
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
