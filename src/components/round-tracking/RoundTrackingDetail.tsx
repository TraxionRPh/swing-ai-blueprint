
import { useState, useEffect } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useToast } from "@/hooks/use-toast";

interface RoundTrackingDetailProps {
  onBack: () => void;
  currentRoundId: string | null;
  isLoading: boolean;
  retryLoading: () => void;
  roundTracking: any;
}

export const RoundTrackingDetail = ({
  onBack,
  currentRoundId,
  isLoading,
  retryLoading,
  roundTracking
}: RoundTrackingDetailProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  const { toast } = useToast();
  
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

  // Check initial rendering status
  useEffect(() => {
    if (initialRender) {
      console.log("Initial render of RoundTrackingDetail");
      // After a short delay, consider the component as no longer in initial render
      const timer = setTimeout(() => setInitialRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [initialRender]);

  // Force exit from loading state after 8 seconds
  useEffect(() => {
    if (!isLoading) return;
    
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true);
      console.log("Forcing exit from loading state after timeout");
    }, 5000); // Reduced from 8s to 5s for faster response
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Log current hole data when it changes
  useEffect(() => {
    console.log(`RoundTrackingDetail - Current hole: ${currentHole}`, {
      currentHoleData,
      holeCount: holeCount || 18
    });
  }, [currentHole, currentHoleData, holeCount]);

  // Determine effective loading state
  const effectiveLoading = (isLoading || initialRender) && !loadingTimeout;

  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      roundTracking.handleNext();
    }
  };

  // Check if we have resume data in storage
  useEffect(() => {
    const sessionResumeHole = sessionStorage.getItem('resume-hole-number');
    const localResumeHole = localStorage.getItem('resume-hole-number');
    
    if (sessionResumeHole) {
      console.log("Found resume hole in sessionStorage:", sessionResumeHole);
    }
    
    if (localResumeHole) {
      console.log("Found resume hole in localStorage:", localResumeHole);
    }
  }, []);

  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={onBack} />
      
      {effectiveLoading ? (
        <LoadingState 
          onBack={onBack} 
          message="Loading your round data..." 
          retryFn={retryLoading}
          roundId={currentRoundId || undefined}
        />
      ) : showFinalScore ? (
        <FinalScoreView 
          holeScores={holeScores}
          holeCount={holeCount || 18}
          finishRound={finishRound}
          onBack={onBack}
        />
      ) : (
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
      )}
    </div>
  );
};
