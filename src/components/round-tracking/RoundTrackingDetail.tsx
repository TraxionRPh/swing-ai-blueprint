
import { useState, useEffect } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useToast } from "@/hooks/use-toast";
import { HoleSavingIndicator } from "@/components/round-tracking/hole-score/HoleSavingIndicator";

interface RoundTrackingDetailProps {
  onBack: () => void;
  currentRoundId: string | null;
  isLoading: boolean;
  loadingStage?: string;
  retryLoading: () => void;
  roundTracking: any;
}

export const RoundTrackingDetail = ({
  onBack,
  currentRoundId,
  isLoading,
  loadingStage = "Loading...",
  retryLoading,
  roundTracking
}: RoundTrackingDetailProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const { toast } = useToast();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const {
    selectedCourse,
    currentHole,
    holeScores,
    holeCount,
    handleHoleUpdate,
    handlePrevious,
    currentTeeColor,
    currentHoleData,
    isSaving,
    finishRound,
  } = roundTracking;

  // Handle back navigation with cleanup
  const handleBackNavigation = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    onBack();
  };

  // Add transition delay to prevent flash of loading states
  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(true);
    }
  }, [isLoading]);

  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      roundTracking.handleNext();
    }
  };

  // Show loading state when we're loading data
  if (isLoading || isTransitioning) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBackNavigation} />
        
        <LoadingState 
          onBack={handleBackNavigation} 
          message={`Loading round data... (${loadingStage})`} 
          retryFn={retryLoading}
          roundId={currentRoundId || undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={handleBackNavigation} />
      
      {showFinalScore ? (
        <FinalScoreView 
          holeScores={holeScores}
          holeCount={holeCount || 18}
          finishRound={finishRound}
          onBack={onBack}
        />
      ) : (
        <>
          <HoleScoreView 
            currentHoleData={currentHoleData}
            handleHoleUpdate={handleHoleUpdate}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            currentHole={currentHole}
            holeCount={holeCount || 18}
            teeColor={currentTeeColor}
            courseId={selectedCourse?.id}
            isSaving={isSaving}
            holeScores={holeScores}
          />
          <HoleSavingIndicator isSaving={isSaving} />
        </>
      )}
    </div>
  );
};
