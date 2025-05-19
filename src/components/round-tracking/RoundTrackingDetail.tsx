
import { useEffect, useState } from "react";
import { useScoreTracking } from "@/hooks/round-tracking/score/useScoreTracking";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { Loading } from "@/components/ui/loading";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";

interface Props {
  onBack: () => void;
  currentRoundId: string | null;
  initialHoleNumber: number | null;
  retryLoading: () => void;
  setDetailLoading: (value: boolean) => void;
  setDetailError: (value: string | null) => void;
  courseId?: string | null;
  teeId?: string | null;
}

export const RoundTrackingDetail = ({
  onBack,
  currentRoundId,
  initialHoleNumber,
  retryLoading,
  setDetailLoading,
  setDetailError,
  courseId,
  teeId,
}: Props) => {
  const [holeScores, setHoleScores] = useState([]);
  const [currentHole, setCurrentHole] = useState(initialHoleNumber || 1);
  const [holeCount, setHoleCount] = useState(18);
  const [isLoading, setIsLoading] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  
  const {
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData,
    clearResumeData,
    finishRound,
  } = useScoreTracking(currentRoundId, courseId || undefined, holeScores, setHoleScores);

  useEffect(() => {
    if (initialHoleNumber) {
      setCurrentHole(initialHoleNumber);
    }
  }, [initialHoleNumber]);

  // Set parent loading state based on local loading state
  useEffect(() => {
    setDetailLoading(isLoading);
    if (!isLoading && !holeScores.length) {
      setDetailError("No hole data found");
    } else {
      setDetailError(null);
    }
  }, [isLoading, holeScores, setDetailError, setDetailLoading]);

  // Force exit from loading state if it takes too long
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      console.log("Forcing exit from loading state after timeout");
      setIsLoading(false);
    }, 1000); // 1 second timeout
    
    return () => clearTimeout(loadingTimeout);
  }, []);
  
  const handleSubmitRound = async () => {
    console.log("Submitting final round score");
    if (typeof finishRound === 'function') {
      await finishRound();
    }
    clearResumeData();
    onBack();
  };

  const handleShowReviewCard = () => {
    console.log("Showing final score card for review");
    setShowFinalScore(true);
  };

  const handleCancelReview = () => {
    console.log("Cancelling review, returning to hole view");
    setShowFinalScore(false);
  };
  
  if (isLoading) {
    return <Loading message="Loading hole data..." minHeight={250} />;
  }

  if (showFinalScore) {
    return (
      <FinalScoreCard
        holeScores={holeScores.slice(0, holeCount)}
        isOpen={true}
        onConfirm={handleSubmitRound}
        onCancel={handleCancelReview}
        holeCount={holeCount}
      />
    );
  }
  
  return (
    <HoleScoreView
      currentHoleData={currentHoleData}
      handleHoleUpdate={handleHoleUpdate}
      handleNext={handleNext}
      handlePrevious={handlePrevious}
      currentHole={currentHole}
      holeCount={holeCount}
      isSaving={isSaving}
      isLoading={isLoading}
      holeScores={holeScores}
      teeColor={teeId ? "blue" : undefined}
      courseId={courseId || undefined}
      teeId={teeId || undefined}
    />
  );
};
