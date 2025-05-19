
import { useCallback, useState } from "react";
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
  onFinish?: () => void; // Added this prop to match what's being passed in RoundTrackingDetail
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
  onFinish // Added this prop to the destructuring
}: HoleScoreViewProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  
  console.log("HoleScoreView rendered with current hole:", currentHole, "out of", holeCount);
  console.log("Current hole data in HoleScoreView:", currentHoleData);
  console.log("Using course ID:", courseId, "tee ID:", teeId, "with color:", teeColor);
  console.log("Save status:", { isSaving, saveSuccess, saveError });
    
  // Enhanced navigation handlers with useCallback to prevent unnecessary re-renders
  const handleNextHole = useCallback(() => {
    console.log(`Next clicked in HoleScoreView for hole ${currentHole}`);
    handleNext();
  }, [handleNext, currentHole]);
  
  const handlePreviousHole = useCallback(() => {
    console.log(`Previous clicked in HoleScoreView for hole ${currentHole}`);
    handlePrevious();
  }, [handlePrevious, currentHole]);
  
  const handleReviewRound = useCallback(() => {
    console.log("Review Round button clicked, checking if should show final scorecard");
    
    // Only show final score when completing a full 18-hole round
    if (holeCount === 18 && currentHole === 18) {
      console.log("Showing final scorecard for 18-hole round");
      if (onFinish) {
        onFinish();
      } else {
        setShowFinalScore(true);
      }
    } else {
      // For 9-hole rounds or other scenarios, just move forward without showing the dialog
      console.log("Not showing final scorecard for non-18-hole round");
      handleNext();
    }
  }, [onFinish, holeCount, currentHole, handleNext]);
  
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
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Add score summary at the top */}
      <ScoreSummary holeScores={holeScores} />
      
      <HoleScoreCard
        holeData={currentHoleData}
        onUpdate={handleHoleUpdate}
        onNext={handleNextHole}
        onPrevious={handlePreviousHole}
        onReviewRound={handleReviewRound}
        isFirst={currentHole === 1}
        isLast={currentHole === holeCount || currentHole === 9 || currentHole === 18}
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
