
import { useState, useEffect, useCallback } from "react";
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
      
      // Exit loading state once ID is set
      setLocalLoading(false);
      if (setDetailLoading) setDetailLoading(false);
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
    handlePrevious: handlePreviousBase,
    currentTeeColor,
    currentHoleData,
    isSaving,
    finishRound
  } = roundTracking;

  useEffect(() => {
    // Force data refresh when currentHole changes
    console.log(`Current hole in RoundTrackingDetail: ${currentHole}`);
  }, [currentHole]);

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

  // Enhanced navigation handlers with better logging and explicit state updates
  const handleNext = useCallback(() => {
    console.log("Next button pressed in RoundTrackingDetail, current hole:", currentHole, "holeCount:", holeCount);
    
    if (typeof handleNextBase !== 'function') {
      console.error("Next handler is not defined or not a function!", typeof handleNextBase);
      toast({
        title: "Navigation Error",
        description: "Could not navigate to next hole. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentHole === holeCount) {
      console.log("Showing final score view");
      setShowFinalScore(true);
    } else {
      console.log("Moving to next hole via base handler");
      
      // Force state update with direct assignment if available
      if (setCurrentHole && typeof setCurrentHole === 'function') {
        const nextHole = currentHole + 1;
        if (nextHole <= (holeCount || 18)) {
          console.log(`Directly setting hole to ${nextHole}`);
          setCurrentHole(nextHole);
        }
      }
      
      // Also call the base handler for any additional logic
      handleNextBase();
      
      // Show toast to provide feedback
      toast({
        title: "Navigation",
        description: `Moving to hole ${currentHole + 1}`
      });
    }
  }, [handleNextBase, currentHole, holeCount, toast, setCurrentHole]);
  
  const handlePrevious = useCallback(() => {
    console.log("Previous button pressed in RoundTrackingDetail, current hole:", currentHole);
    
    if (typeof handlePreviousBase !== 'function') {
      console.error("Previous handler is not defined or not a function!", typeof handlePreviousBase);
      toast({
        title: "Navigation Error",
        description: "Could not navigate to previous hole. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Moving to previous hole via base handler");
    
    // Force state update with direct assignment if available
    if (setCurrentHole && typeof setCurrentHole === 'function') {
      const prevHole = currentHole - 1;
      if (prevHole >= 1) {
        console.log(`Directly setting hole to ${prevHole}`);
        setCurrentHole(prevHole);
      }
    }
    
    // Also call the base handler for any additional logic
    handlePreviousBase();
    
    // Show toast to provide feedback
    toast({
      title: "Navigation",
      description: `Moving to hole ${currentHole - 1}`
    });
  }, [handlePreviousBase, currentHole, toast, setCurrentHole]);

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
