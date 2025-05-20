
import { useEffect, useState } from "react";
import { useScoreTracking } from "@/hooks/round-tracking/score/useScoreTracking";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { Loading } from "@/components/ui/loading";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useRoundManagement } from "@/hooks/round-tracking/useRoundManagement";
import { useAuth } from "@/context/AuthContext";
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
  const [holeCount, setHoleCount] = useState(18);
  const [isLoading, setIsLoading] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  
  const { finishRound: finishRoundBase } = useRoundManagement(user);
  
  const {
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData,
    clearResumeData,
  } = useScoreTracking(currentRoundId, courseId || undefined, holeScores, setHoleScores);

  useEffect(() => {
    if (initialHoleNumber) {
      setCurrentHole(initialHoleNumber);
    }
  }, [initialHoleNumber]);

  // Detect 9-hole rounds from URL or session storage
  useEffect(() => {
    const path = window.location.pathname;
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    
    if (path.includes('/rounds/new/9')) {
      console.log("9-hole round detected from URL");
      setHoleCount(9);
      sessionStorage.setItem('current-hole-count', '9');
    } else if (path.includes('/rounds/new/1')) {
      console.log("1-hole round detected from URL");
      setHoleCount(1);
      sessionStorage.setItem('current-hole-count', '1');
    } else if (storedHoleCount) {
      const count = parseInt(storedHoleCount);
      console.log(`${count}-hole round detected from session storage`);
      setHoleCount(count);
    } else {
      console.log("18-hole round assumed");
      setHoleCount(18);
      sessionStorage.setItem('current-hole-count', '18');
    }
    
    console.log("RoundTrackingDetail - holeCount set to:", holeCount);
  }, []);
  
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
  }, []);
  
  const finishRound = async (holeCount: number) => {
    if (finishRoundBase) {
      console.log(`RoundTrackingDetail - calling finishRoundBase with hole count ${holeCount}`);
      
      // Add validation for new rounds
      if (currentRoundId === "new") {
        console.log("Creating new round before submitting");
        // You would need to implement logic here to create a new round first
        // This is just a placeholder as we need to implement round creation logic
        // For now, we'll just show an error message
        toast({
          title: "Error saving round",
          description: "Please start a new round before submitting",
          variant: "destructive"
        });
        return false;
      }
      
      return await finishRoundBase(holeScores, holeCount);
    }
    return false;
  };

  const handleShowReviewCard = () => {
    console.log("Showing final score card for review with hole count:", holeCount);
    setShowFinalScore(true);
  };

  if (isLoading) {
    return <Loading message="Loading hole data..." minHeight={250} />;
  }

  if (showFinalScore) {
    return (
      <FinalScoreView
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
    />
  );
};
