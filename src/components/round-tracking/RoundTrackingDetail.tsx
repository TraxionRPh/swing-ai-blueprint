
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
  
  // Get the required data from the roundTracking hook
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

  // Log to debug component state
  console.log("RoundTrackingDetail rendering", { 
    currentRoundId, 
    isLoading, 
    holeScores: holeScores?.length || 0,
    currentHole
  });

  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      roundTracking.handleNext();
    }
  };

  // If data is still loading, show the loading state
  if (isLoading) {
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

  // Render the actual content when data is loaded
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
