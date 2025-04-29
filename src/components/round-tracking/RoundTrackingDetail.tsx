
import { useState } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";
import { ActiveRoundContent } from "@/components/round-tracking/score/ActiveRoundContent";

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
  
  const {
    selectedCourse,
    currentHole,
    holeScores,
    holeCount,
    handleHoleUpdate,
    handleNext: moveToNextHole,
    handlePrevious,
    currentTeeColor,
    currentHoleData,
    isSaving,
    finishRound,
  } = roundTracking;

  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      moveToNextHole();
    }
  };

  const handleConfirmRound = async () => {
    const success = await finishRound(holeCount);
    setShowFinalScore(false);
    
    if (success) {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={onBack} />
      
      {isLoading ? (
        <LoadingState 
          onBack={onBack} 
          message="Loading your round data..." 
          retryFn={retryLoading}
          roundId={currentRoundId || undefined}
        />
      ) : (
        <ActiveRoundContent
          holeScores={holeScores}
          currentHoleData={currentHoleData}
          onHoleUpdate={handleHoleUpdate}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentHole={currentHole}
          holeCount={holeCount || 18}
          teeColor={currentTeeColor}
          courseId={selectedCourse?.id}
          isSaving={isSaving}
          showFinalScore={showFinalScore}
          onConfirmRound={handleConfirmRound}
          onCancelFinalScore={() => setShowFinalScore(false)}
        />
      )}
    </div>
  );
};
