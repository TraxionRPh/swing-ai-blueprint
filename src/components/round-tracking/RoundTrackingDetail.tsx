
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
  
  // Get hole count from URL and session storage with improved detection
  const { holeCount, detectHoleCountFromUrl } = useHoleCountDetection();
  
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

  // Ensure correct hole number and redetect hole count when URL changes
  useEffect(() => {
    if (initialHoleNumber) {
      setCurrentHole(initialHoleNumber);
    }
    
    // Re-detect hole count when component mounts or URL changes
    const detectedCount = detectHoleCountFromUrl();
    console.log(`RoundTrackingDetail - detected hole count: ${detectedCount}`);
    
    // Add URL-based validation
    const path = window.location.pathname;
    const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
    
    // Force session storage to match URL for 9-hole rounds
    if (is9HoleRound && sessionStorage.getItem('current-hole-count') !== '9') {
      console.log("URL indicates 9-hole round, fixing session storage");
      sessionStorage.setItem('current-hole-count', '9');
    }
    
  }, [initialHoleNumber, detectHoleCountFromUrl, window.location.pathname]);
  
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
      setIsLoading(false);
    }, 1000); // 1 second timeout
    
    return () => clearTimeout(loadingTimeout);
  }, [setIsLoading]);
  
  // Log the hole count on every render for debugging
  useEffect(() => {
    console.log(`RoundTrackingDetail - Current hole count: ${holeCount}`);
    console.log(`RoundTrackingDetail - Current hole: ${currentHole}/${holeCount}`);
    console.log(`RoundTrackingDetail - Path: ${window.location.pathname}`);
    
    // Also log the session storage value directly
    const sessionHoleCount = sessionStorage.getItem('current-hole-count');
    console.log(`RoundTrackingDetail - Session storage hole count: ${sessionHoleCount}`);
    
    // URL-based validation
    const path = window.location.pathname;
    const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
    if (is9HoleRound && sessionHoleCount !== '9') {
      console.log("RoundTrackingDetail - URL indicates 9 holes but session storage is different, fixing");
      sessionStorage.setItem('current-hole-count', '9');
    }
  }, [currentHole, holeCount, window.location.pathname]);
  
  // Enhanced finishRound function with clear hole count handling
  const finishRound = async () => {
    try {
      // Re-detect hole count to make sure we have the correct value
      detectHoleCountFromUrl();
      
      // URL-based validation
      const path = window.location.pathname;
      const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
      
      // Force hole count to 9 for 9-hole rounds regardless of other settings
      const finalHoleCount = is9HoleRound ? 9 : holeCount;
      
      console.log(`RoundTrackingDetail - finishing round with hole count ${finalHoleCount}`);
      
      // Store the hole count in session storage before saving
      sessionStorage.setItem('current-hole-count', finalHoleCount.toString());
      
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
      
      // Now save the completed round with explicit hole count
      if (finishRoundBase) {
        toast({
          title: "Saving round",
          description: `Saving your ${finalHoleCount}-hole round...`,
        });
        
        // Pass the explicit hole count to finishRoundBase
        return await finishRoundBase(holeScores, finalHoleCount, roundIdToUse);
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

  // Handler to show the final score card
  const handleShowReviewCard = () => {
    // URL-based validation
    const path = window.location.pathname;
    const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
    
    // Force hole count to 9 for 9-hole rounds regardless of other settings
    const finalHoleCount = is9HoleRound ? 9 : holeCount;
    
    console.log(`Showing final score card for review with hole count: ${finalHoleCount}`);
    
    // Re-verify the hole count before showing the review
    sessionStorage.setItem('current-hole-count', finalHoleCount.toString());
    
    setShowFinalScore(true);
  };

  if (isLoading) {
    return <RoundLoadingState />;
  }

  if (showFinalScore) {
    // URL-based validation
    const path = window.location.pathname;
    const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
    
    // Force hole count to 9 for 9-hole rounds regardless of other settings
    const finalHoleCount = is9HoleRound ? 9 : holeCount;
    
    return (
      <RoundReview
        holeScores={holeScores.slice(0, finalHoleCount)}
        holeCount={finalHoleCount}
        finishRound={finishRound}
        onBack={() => {
          setShowFinalScore(false);
          clearResumeData();
        }}
      />
    );
  }
  
  // Calculate if this is the last hole based on the current hole count
  // URL-based validation for extra safety
  const path = window.location.pathname;
  const is9HoleRound = path.includes('/rounds/new/9') || path.endsWith('/9');
  
  // Force hole count to 9 for 9-hole rounds regardless of other settings
  const effectiveHoleCount = is9HoleRound ? 9 : holeCount;
  
  // Calculate isLastHole using the effective hole count
  const isLastHole = currentHole === effectiveHoleCount;
  
  console.log(`RoundTrackingDetail - Is last hole check: ${currentHole} === ${effectiveHoleCount} = ${isLastHole}`);
  console.log(`RoundTrackingDetail - URL is9HoleRound check: ${is9HoleRound}`);
  
  return (
    <HoleScoreView
      currentHoleData={currentHoleData}
      handleHoleUpdate={handleHoleUpdate}
      handleNext={handleNext}
      handlePrevious={handlePrevious}
      currentHole={currentHole}
      holeCount={effectiveHoleCount}
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
