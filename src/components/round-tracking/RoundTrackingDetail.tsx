
import { useState, useEffect } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useToast } from "@/hooks/use-toast";
import { useRoundTracking } from "@/hooks/useRoundTracking";
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
  const [localLoading, setLocalLoading] = useState(true);
  const { toast } = useToast();
  
  console.log("RoundTrackingDetail rendered with ID:", currentRoundId, "loading:", localLoading);
  
  // Use round tracking hook
  const roundTracking = useRoundTracking();
  
  // Set the current round ID when the component mounts
  useEffect(() => {
    console.log("Setting current round ID:", currentRoundId);
    
    if (currentRoundId && roundTracking.setCurrentRoundId) {
      roundTracking.setCurrentRoundId(currentRoundId);
      
      // Start a timer to force exit from loading after a reasonable time
      const timer = setTimeout(() => {
        console.log("Forcing exit from loading state after timeout");
        setLocalLoading(false);
        if (setDetailLoading) setDetailLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      // No round ID, exit loading immediately
      setLocalLoading(false);
      if (setDetailLoading) setDetailLoading(false);
    }
  }, [currentRoundId, roundTracking.setCurrentRoundId, setDetailLoading]);
  
  // Handle errors from the roundTracking hook
  useEffect(() => {
    if (roundTracking.error && setDetailError) {
      console.error("Round tracking error:", roundTracking.error);
      setDetailError(roundTracking.error);
    }
  }, [roundTracking.error, setDetailError]);
  
  // Get the required data from the roundTracking hook
  const {
    selectedCourse,
    currentHole,
    setCurrentHole,
    holeScores,
    holeCount,
    handleHoleUpdate,
    handleNext: handleNextBase,
    handlePrevious,
    currentTeeColor,
    currentHoleData,
    isSaving,
    finishRound
  } = roundTracking;

  // Apply resume hole if available
  useEffect(() => {
    if (localLoading || !setCurrentHole) return;
    
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number') || 
                            localStorage.getItem('resume-hole-number');
    
    if (resumeHoleNumber) {
      const holeNum = parseInt(resumeHoleNumber, 10);
      
      if (!isNaN(holeNum) && holeNum >= 1 && holeNum <= (holeCount || 18)) {
        console.log(`Resuming at hole ${holeNum}`);
        setCurrentHole(holeNum);
        
        toast({
          title: "Resuming round",
          description: `Continuing from hole ${holeNum}`
        });
      }
    }
    
    // Clear the force-resume flag
    sessionStorage.removeItem('force-resume');
  }, [localLoading, holeCount, setCurrentHole, toast]);

  // Handle back navigation with cleanup
  const handleBackNavigation = () => {
    console.log("Back navigation triggered in RoundTrackingDetail");
    // Clear any resume data
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    onBack();
  };

  // Check if we have the data we need to render
  const isDataReady = !localLoading && holeScores?.length > 0 && !!currentHoleData;
  console.log("Data ready check:", { isDataReady, localLoading, holeScoresLength: holeScores?.length });

  // Handle next button with final score
  const handleNext = () => {
    console.log("Next button pressed in RoundTrackingDetail, current hole:", currentHole, "holeCount:", holeCount);
    if (currentHole === holeCount) {
      console.log("Showing final score view");
      setShowFinalScore(true);
    } else if (handleNextBase) {
      console.log("Moving to next hole");
      handleNextBase();
    }
  };

  // If data is still loading, show a loading indicator
  if (!isDataReady) {
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
