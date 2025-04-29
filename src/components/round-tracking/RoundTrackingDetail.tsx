
import { useState } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";

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
    handlePrevious,
    currentTeeColor,
    currentHoleData,
    isSaving,
    finishRound,
  } = roundTracking || {};

  // Handle next hole - if on last hole, show final score view
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

  // Always render content without loading state to avoid flicker
  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={onBack} />
      
      {showFinalScore ? (
        <FinalScoreView 
          holeScores={holeScores || []}
          holeCount={holeCount || 18}
          finishRound={finishRound}
          onBack={onBack}
        />
      ) : (
        <HoleScoreView 
          currentHoleData={currentHoleData || {
            holeNumber: currentHole || 1,
            par: 4,
            distance: 0,
            score: 0,
            putts: 0,
            fairwayHit: false,
            greenInRegulation: false
          }}
          handleHoleUpdate={handleHoleUpdate || (() => {})}
          handleNext={handleNext}
          handlePrevious={handlePrevious || (() => {})}
          currentHole={currentHole || 1}
          holeCount={holeCount || 18}
          teeColor={currentTeeColor || 'blue'}
          courseId={selectedCourse?.id}
          isSaving={isSaving || false}
          holeScores={holeScores || []}
        />
      )}
    </div>
  );
};
