
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
  const [componentMounted, setComponentMounted] = useState(false);
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
  } = roundTracking || {}; // Add null check with default empty object
  
  // Track component mount status
  useEffect(() => {
    setComponentMounted(true);
    return () => setComponentMounted(false);
  }, []);

  // Check initial rendering status and data availability
  useEffect(() => {
    if (initialRender) {
      console.log("Initial render of RoundTrackingDetail");
      // After a short delay, consider the component as no longer in initial render
      const timer = setTimeout(() => setInitialRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [initialRender]);

  // Force exit from loading state after timeout
  useEffect(() => {
    if (!isLoading) return;
    
    const timeoutId = setTimeout(() => {
      if (componentMounted) {
        setLoadingTimeout(true);
        console.log("Forcing exit from loading state after timeout");
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, componentMounted]);

  // Log when roundTracking data becomes available
  useEffect(() => {
    if (roundTracking && currentRoundId) {
      console.log("RoundTrackingDetail - roundTracking data is now available");
    }
  }, [roundTracking, currentRoundId]);

  // Log current hole data when it changes
  useEffect(() => {
    if (currentHole && currentHoleData) {
      console.log(`RoundTrackingDetail - Current hole: ${currentHole}`, {
        currentHoleData,
        holeCount: holeCount || 18
      });
    }
  }, [currentHole, currentHoleData, holeCount]);

  // Determine effective loading state - consider data availability
  const effectiveLoading = (isLoading || initialRender || !roundTracking || !currentHoleData) && !loadingTimeout;

  const handleNext = () => {
    if (!roundTracking?.handleNext) {
      console.error("handleNext function is not available");
      return;
    }
    
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      roundTracking.handleNext();
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
          currentHoleData={currentHoleData}
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
