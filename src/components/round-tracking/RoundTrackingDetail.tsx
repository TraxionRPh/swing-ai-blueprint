
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
  
  // Use round tracking hook
  const roundTracking = useRoundTracking();
  
  // Set the current round ID when the component mounts
  useEffect(() => {
    console.log("RoundTrackingDetail - Setting current round ID:", currentRoundId);
    if (currentRoundId && roundTracking.setCurrentRoundId) {
      roundTracking.setCurrentRoundId(currentRoundId);
    }
  }, [currentRoundId, roundTracking.setCurrentRoundId]);
  
  // Exit loading state after a short delay
  useEffect(() => {
    console.log("Setting up loading exit timer");
    const timer = setTimeout(() => {
      setLocalLoading(false);
      if (setDetailLoading) setDetailLoading(false);
      console.log("RoundTrackingDetail - Exiting loading state");
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [setDetailLoading]);
  
  // Handle errors from the roundTracking hook
  useEffect(() => {
    if (roundTracking.error && setDetailError) {
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

  // Apply resume hole if available - simplified approach
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
    // Clear any resume data to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    onBack();
  };

  // Check if we have the data we need to render
  const isDataReady = !localLoading && holeScores?.length > 0 && !!currentHoleData;

  // Handle next button with final score
  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else if (handleNextBase) {
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
