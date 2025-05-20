
import { useEffect, useState } from "react";
import { useScoreTracking } from "@/hooks/round-tracking/score/useScoreTracking";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { RoundLoadingState } from "@/components/round-tracking/loading/RoundLoadingState";
import { RoundReview } from "@/components/round-tracking/review/RoundReview";
import { useRoundManagement } from "@/hooks/round-tracking/useRoundManagement";
import { useAuth } from "@/context/AuthContext";
import { useHoleCountDetection } from "@/hooks/round-tracking/useHoleCountDetection";
import { useRoundCreation } from "@/hooks/round-tracking/useRoundCreation";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onBack: () => void;
  currentRoundId: string | null;
  initialHoleNumber: number | null;
  retryLoading: () => void;
  setDetailLoading: (value: boolean) => void;
  setDetailError: (value: string | null) => void;
  courseId?: string | null;
  teeId?: string | null;
}

export const RoundTrackingDetail = ({
  onBack,
  currentRoundId,
  initialHoleNumber,
  retryLoading,
  setDetailLoading,
  setDetailError,
  courseId,
  teeId,
}: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [holeScores, setHoleScores] = useState([]);
  const [currentHole, setCurrentHole] = useState(initialHoleNumber || 1);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const { holeCount } = useHoleCountDetection();
  
  const { 
    isLoading, 
    setIsLoading,
    createdRoundId, 
    createNewRound 
  } = useRoundCreation(user);
  
  const { finishRound: finishRoundBase } = useRoundManagement();
  
  const {
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData,
    clearResumeData,
  } = useScoreTracking(createdRoundId || currentRoundId, courseId || undefined, holeScores, setHoleScores);

  useEffect(() => {
    if (initialHoleNumber) {
      setCurrentHole(initialHoleNumber);
    }
  }, [initialHoleNumber]);
  
  // Set parent loading state based on local loading state
  useEffect(() => {
    setDetailLoading(isLoading);
    if (!isLoading && !holeScores.length) {
      setDetailError("No hole data found");
    } else {
      setDetailError(null);
    }
  }, [isLoading, holeScores, setDetailError, setDetailLoading]);

  // Force exit from loading state if it takes too long
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      console.log("Forcing exit from loading state after timeout");
      setIsLoading(false);
    }, 1000); // 1 second timeout
    
    return () => clearTimeout(loadingTimeout);
  }, [setIsLoading]);
  
  const finishRound = async (holeCount: number) => {
    try {
      console.log(`RoundTrackingDetail - finishing round with hole count ${holeCount}`);
      
      // Store the hole count in session storage before saving
      sessionStorage.setItem('current-hole-count', holeCount.toString());
      
      let roundIdToUse = createdRoundId || currentRoundId;
      
      // If this is a new round, create it in the database first
      if (roundIdToUse === "new") {
        console.log("Creating new round before submitting");
        toast({
          title: "Creating round",
          description: "Setting up your round in the database...",
        });
        
        const newRoundId = await createNewRound();
        if (!newRoundId) {
          toast({
            title: "Error",
            description: "Could not create a new round. Please try again.",
            variant: "destructive"
          });
          return false;
        }
        
        console.log("Created new round with ID:", newRoundId);
        roundIdToUse = newRoundId;
      }
      
      // Now save the completed round
      if (finishRoundBase) {
        toast({
          title: "Saving round",
          description: `Saving your ${holeCount}-hole round...`,
        });
        
        return await finishRoundBase(holeScores, holeCount, roundIdToUse);
      }
      
      return false;
    } catch (error) {
      console.error("Error finishing round:", error);
      toast({
        title: "Error",
        description: "Failed to save your round. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleShowReviewCard = () => {
    console.log("Showing final score card for review with hole count:", holeCount);
    setShowFinalScore(true);
  };

  if (isLoading) {
    return <RoundLoadingState />;
  }

  if (showFinalScore) {
    return (
      <RoundReview
        holeScores={holeScores}
        holeCount={holeCount}
        finishRound={finishRound}
        onBack={() => {
          setShowFinalScore(false);
          clearResumeData();
        }}
      />
    );
  }
  
  console.log("RoundTrackingDetail rendering with currentHole:", currentHole, "of", holeCount);
  
  // Determine if this is the last hole
  const isLastHole = currentHole === holeCount;
  console.log("Is last hole check:", {currentHole, holeCount, isLastHole, path: window.location.pathname});
  
  return (
    <HoleScoreView
      currentHoleData={currentHoleData}
      handleHoleUpdate={handleHoleUpdate}
      handleNext={handleNext}
      handlePrevious={handlePrevious}
      currentHole={currentHole}
      holeCount={holeCount}
      isSaving={isSaving}
      isLoading={isLoading}
      holeScores={holeScores}
      teeColor={teeId ? "blue" : undefined}
      courseId={courseId || undefined}
      teeId={teeId || undefined}
      onFinish={handleShowReviewCard}
      isLast={isLastHole}
    />
  );
};
