
import { useState, useEffect, useMemo } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";

interface RoundTrackingDetailProps {
  onBack: () => void;
  currentRoundId: string | null;
  isLoading: boolean;
  retryLoading: () => void;
  roundTracking: any;
  networkError?: boolean;
}

export const RoundTrackingDetail = ({
  onBack,
  currentRoundId,
  isLoading,
  retryLoading,
  roundTracking,
  networkError = false,
}: RoundTrackingDetailProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
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

  // Force exit from loading state after 5 seconds (reduced from 8s to 5s)
  useEffect(() => {
    if (!isLoading) return;
    
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Determine effective loading state
  const effectiveLoading = useMemo(() => 
    isLoading && !loadingTimeout, 
    [isLoading, loadingTimeout]
  );

  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      roundTracking.handleNext();
    }
  };

  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={onBack} />
      
      {networkError && (
        <Alert variant="destructive" className="mb-4">
          <WifiOff className="h-4 w-4 mr-2" />
          <AlertTitle>Network Connection Issue</AlertTitle>
          <AlertDescription>
            You appear to be offline. Some data may not be available and changes may not be saved.
          </AlertDescription>
        </Alert>
      )}
      
      {effectiveLoading ? (
        <LoadingState 
          onBack={onBack} 
          message="Loading your round data..." 
          retryFn={retryLoading}
          roundId={currentRoundId || undefined}
          networkError={networkError}
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
