
import { useState, useEffect, useCallback } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useRoundContext } from "@/hooks/round-tracking/useRoundContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

interface RoundTrackingDetailProps {
  onBack: () => void;
  currentRoundId: string | null;
  isLoading?: boolean;
  loadingStage?: string;
  retryLoading: () => void;
  setDetailLoading?: (loading: boolean) => void;
  setDetailError?: (error: string | null) => void;
}

export const RoundTrackingDetail = ({
  onBack,
  currentRoundId,
  isLoading: externalLoading,
  loadingStage = "Loading...",
  retryLoading,
  setDetailLoading,
  setDetailError
}: RoundTrackingDetailProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  
  console.log("RoundTrackingDetail rendered with ID:", currentRoundId);
  
  // Use our consolidated round context hook
  const {
    currentHole,
    setCurrentHole,
    handleNext,
    handlePrevious,
    handleHoleUpdate,
    currentHoleData,
    holeScores,
    courseData,
    isLoading,
    isSaving,
    holeCount,
    clearResumeData
  } = useRoundContext(currentRoundId);
  
  // Handle errors and loading state
  useEffect(() => {
    if (setDetailLoading) {
      setDetailLoading(isLoading);
    }
  }, [isLoading, setDetailLoading]);
  
  // Enhanced next handler to show final score view
  const handleNextWithFinalView = useCallback(() => {
    if (currentHole === holeCount) {
      console.log("Showing final score view");
      setShowFinalScore(true);
    } else {
      handleNext();
    }
  }, [currentHole, holeCount, handleNext]);

  // Handle back navigation with cleanup
  const handleBackNavigation = () => {
    console.log("Back navigation triggered in RoundTrackingDetail");
    clearResumeData();
    onBack();
  };

  // Handle finishing the round - Fixed to match the expected type
  const finishRound = useCallback(async (_holeCount: number) => {
    clearResumeData();
    onBack();
    return true; // Return a Promise<boolean> as expected
  }, [clearResumeData, onBack]);

  // If data is still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBackNavigation} />
        
        <Card>
          <CardContent className="py-6 flex justify-center">
            <Loading message={`Loading round data for ${currentRoundId?.substring(0, 8)}...`} minHeight={200} />
          </CardContent>
        </Card>
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
        <HoleScoreView 
          currentHoleData={currentHoleData}
          handleHoleUpdate={handleHoleUpdate}
          handleNext={handleNextWithFinalView}
          handlePrevious={handlePrevious}
          currentHole={currentHole}
          holeCount={holeCount || 18}
          teeColor={courseData?.course_tees?.[0]?.color}
          courseId={courseData?.id}
          isSaving={isSaving}
          holeScores={holeScores}
        />
      )}
    </div>
  );
};
