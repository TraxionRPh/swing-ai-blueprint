
import { useState, useEffect } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useToast } from "@/hooks/use-toast";
import { useResumeSession } from "@/hooks/round-tracking/score/use-resume-session";

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
  const [componentMounted, setComponentMounted] = useState(false);
  const { toast } = useToast();
  
  // Track component mount status
  useEffect(() => {
    setComponentMounted(true);
    return () => setComponentMounted(false);
  }, []);

  // Force exit from loading state after a short timeout
  useEffect(() => {
    if (!isLoading) return;
    
    const timeoutId = setTimeout(() => {
      if (componentMounted) {
        setLoadingTimeout(true);
        console.log("Forcing exit from loading state after timeout");
      }
    }, 1000); // Reduced from 3000 to 1000ms for faster response
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, componentMounted]);

  // Destructure roundTracking with default values to prevent errors
  const {
    selectedCourse,
    currentHole = 1,
    holeScores = [],
    holeCount = 18,
    handleHoleUpdate = () => {},
    handlePrevious = () => {},
    currentTeeColor = '',
    currentHoleData = null,
    isSaving = false,
    finishRound = () => {},
    handleNext: roundTrackingHandleNext = () => {}
  } = roundTracking || {};

  // Determine if we have enough data to show content
  const hasEnoughData = !!(roundTracking && currentHoleData);
  
  // Determine effective loading state - exit loading if we have data or after timeout
  const effectiveLoading = isLoading && !hasEnoughData && !loadingTimeout;

  const handleNext = () => {
    if (!roundTrackingHandleNext) {
      console.error("handleNext function is not available");
      return;
    }
    
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      roundTrackingHandleNext();
    }
  };

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
          holeScores={holeScores || []}
          holeCount={holeCount || 18}
          finishRound={finishRound}
          onBack={onBack}
        />
      ) : (
        <HoleScoreView 
          currentHoleData={currentHoleData || {
            holeNumber: currentHole,
            par: 4,
            distance: 0,
            score: 0,
            putts: 0,
            fairwayHit: false,
            greenInRegulation: false
          }}
          handleHoleUpdate={handleHoleUpdate}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          currentHole={currentHole || 1}
          holeCount={holeCount || 18}
          teeColor={currentTeeColor}
          courseId={selectedCourse?.id}
          isSaving={isSaving || false}
          holeScores={holeScores || []}
        />
      )}
    </div>
  );
};
