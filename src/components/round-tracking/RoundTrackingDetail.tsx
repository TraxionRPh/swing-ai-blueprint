
import { useState, useEffect } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useToast } from "@/hooks/use-toast";
import { HoleSavingIndicator } from "@/components/round-tracking/hole-score/HoleSavingIndicator";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RoundTrackingDetailProps {
  onBack: () => void;
  currentRoundId: string | null;
  isLoading: boolean;
  loadingStage?: string;
  retryLoading: () => void;
  roundTracking?: any; // Make this optional so we can use our own if needed
}

export const RoundTrackingDetail = ({
  onBack,
  currentRoundId,
  isLoading: externalLoading,
  loadingStage = "Loading...",
  retryLoading
}: RoundTrackingDetailProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const { toast } = useToast();
  
  // Use our own instance of roundTracking to ensure we have what we need
  const roundTracking = useRoundTracking();
  
  // Set the current round ID to match what was passed in
  useEffect(() => {
    console.log("RoundTrackingDetail - Setting current round ID:", currentRoundId);
    if (currentRoundId && roundTracking.setCurrentRoundId) {
      roundTracking.setCurrentRoundId(currentRoundId);
    }
  }, [currentRoundId, roundTracking]);
  
  // Set a timeout to exit loading state regardless
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalLoading(false);
      console.log("RoundTrackingDetail - Force exiting loading state after timeout");
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
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

  useEffect(() => {
    // Check if there's forced resume data that should be applied
    const forceResume = sessionStorage.getItem('force-resume');
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number') || 
                            localStorage.getItem('resume-hole-number');
                            
    if (forceResume === 'true' && resumeHoleNumber && !localLoading) {
      const holeNum = parseInt(resumeHoleNumber, 10);
      if (!isNaN(holeNum) && holeNum >= 1 && holeNum <= (holeCount || 18)) {
        console.log(`Applying forced resume to hole ${holeNum}`);
        // Use the setCurrentHole function from roundTracking
        if (roundTracking.setCurrentHole) {
          roundTracking.setCurrentHole(holeNum);
        }
        
        // Clear the force-resume flag once applied
        sessionStorage.removeItem('force-resume');
        
        toast({
          title: "Resuming round",
          description: `Continuing from hole ${holeNum}`
        });
      }
    }
  }, [localLoading, holeCount, roundTracking, toast]);

  // Handle back navigation with cleanup
  const handleBackNavigation = () => {
    // Clear any resume-hole-number in session storage to prevent unexpected behavior
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    onBack();
  };

  // Track if we have the data we need
  const isDataReady = !localLoading && !externalLoading && holeScores && currentHoleData;

  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      roundTracking.handleNext();
    }
  };

  // If data is still loading, show a simple loading skeleton
  if (!isDataReady) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBackNavigation} />
        
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-1/2" />
              <div className="flex justify-between gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
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
