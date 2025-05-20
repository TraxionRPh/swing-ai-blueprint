
import { useEffect, useState } from "react";
import { useScoreTracking } from "@/hooks/round-tracking/score/useScoreTracking";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";
import { Loading } from "@/components/ui/loading";
import { FinalScoreView } from "@/components/round-tracking/score/FinalScoreView";
import { useRoundManagement } from "@/hooks/round-tracking/useRoundManagement";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [createdRoundId, setCreatedRoundId] = useState<string | null>(null);
  
  const { finishRound: finishRoundBase } = useRoundManagement(user);
  
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

  // Detect and set hole count from URL path and sessionStorage
  useEffect(() => {
    const detectHoleCount = () => {
      // Get the current path
      const path = window.location.pathname;
      console.log("Detecting hole count from path:", path);
      
      // First check if specific hole count in URL
      if (path.includes('/rounds/new/9')) {
        console.log("9-hole round detected from URL");
        setHoleCount(9);
        sessionStorage.setItem('current-hole-count', '9');
        return 9;
      } else if (path.includes('/rounds/new/1')) {
        // Check if this is actually a single-hole round (special case)
        const singleHoleRound = path.includes('1-hole') || sessionStorage.getItem('single-hole-round') === 'true';
        
        if (singleHoleRound) {
          console.log("Single-hole round detected");
          setHoleCount(1);
          sessionStorage.setItem('current-hole-count', '1');
          sessionStorage.setItem('single-hole-round', 'true');
          return 1; 
        } else {
          // This is just the first hole of a regular round
          console.log("Regular round, first hole");
          // Check stored hole count
          const storedHoleCount = sessionStorage.getItem('current-hole-count');
          if (storedHoleCount) {
            const count = parseInt(storedHoleCount);
            console.log(`${count}-hole round detected from session storage`);
            setHoleCount(count);
            return count;
          } else {
            // Default to 18
            console.log("No specific hole count found, defaulting to 18");
            setHoleCount(18);
            sessionStorage.setItem('current-hole-count', '18');
            return 18;
          }
        }
      } else {
        // Check stored hole count if no specific indicator in URL
        const storedHoleCount = sessionStorage.getItem('current-hole-count');
        if (storedHoleCount) {
          const count = parseInt(storedHoleCount);
          console.log(`${count}-hole round detected from session storage`);
          setHoleCount(count);
          return count;
        } else {
          // Default to 18
          console.log("No specific hole count found, defaulting to 18");
          setHoleCount(18);
          sessionStorage.setItem('current-hole-count', '18');
          return 18;
        }
      }
    };
    
    // Run the detection and log the result
    const detectedHoleCount = detectHoleCount();
    console.log("RoundTrackingDetail - holeCount set to:", detectedHoleCount);
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
  
  // Create a new round in the database if currentRoundId is "new"
  const createNewRound = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your round",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log("Creating new round in database");
      setIsLoading(true);
      
      // Get course ID from props or session storage
      const actualCourseId = courseId || sessionStorage.getItem('current-course-id');
      const actualTeeId = teeId || sessionStorage.getItem('current-tee-id');
      
      if (!actualCourseId) {
        toast({
          title: "Course Selection Required",
          description: "Please select a course before saving your round",
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }
      
      // Get hole count from session storage
      const storedHoleCount = sessionStorage.getItem('current-hole-count');
      const roundHoleCount = storedHoleCount ? parseInt(storedHoleCount) : holeCount;
      
      // Create the round in the database
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          user_id: user.id,
          course_id: actualCourseId,
          tee_id: actualTeeId || null,
          hole_count: roundHoleCount,
          date: new Date().toISOString().split('T')[0]
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Error creating round:', error);
        toast({
          title: "Error Creating Round",
          description: "Could not create a new round in the database. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }
      
      console.log("Created new round with ID:", data.id);
      setCreatedRoundId(data.id);
      setIsLoading(false);
      return data.id;
    } catch (error) {
      console.error("Error in createNewRound:", error);
      toast({
        title: "Error Creating Round",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return null;
    }
  };
  
  const finishRound = async (holeCount: number) => {
    if (finishRoundBase) {
      console.log(`RoundTrackingDetail - calling finishRoundBase with hole count ${holeCount}`);
      
      let roundIdToUse = createdRoundId || currentRoundId;
      
      // Check if we need to create a new round first
      if (roundIdToUse === "new") {
        console.log("Creating new round before submitting");
        const newRoundId = await createNewRound();
        if (!newRoundId) {
          return false;
        }
        roundIdToUse = newRoundId;
      }
      
      return await finishRoundBase(holeScores, holeCount, roundIdToUse);
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
