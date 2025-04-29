
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCourseManagement } from "./round-tracking/useCourseManagement";
import { useScoreTracking } from "./round-tracking/useScoreTracking";
import { useRoundManagement } from "./round-tracking/useRoundManagement";
import { useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useRoundInitialization } from "./round-tracking/useRoundInitialization";
import { useRoundCourseSelection } from "./round-tracking/useRoundCourseSelection";
import { useRoundNavigation } from "./round-tracking/useRoundNavigation";
import { useRoundFinalization } from "./round-tracking/useRoundFinalization";

export const useRoundTracking = () => {
  const { user } = useAuth();
  const { roundId: urlRoundId } = useParams();
  const { toast } = useToast();
  const location = useLocation();
  
  // Debug current state
  console.log("useRoundTracking init - roundId from URL:", urlRoundId);
  console.log("Current path:", location.pathname);
  
  const {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound: baseFinishRound,
    deleteRound
  } = useRoundManagement(user);

  // Round initialization hook
  const {
    courseName,
    setCourseName,
    holeCount,
    setHoleCount,
    isLoading,
    setIsLoading,
    initAttempt,
    setInitAttempt,
    fetchRoundDetails,
    updateCourseName
  } = useRoundInitialization(user, currentRoundId, setCurrentRoundId);

  const {
    selectedCourse,
    selectedTee,
    setSelectedTee,
    handleCourseSelect: handleCourseSelectBase,
    currentTeeColor
  } = useCourseManagement(currentRoundId);

  const {
    currentHole,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    handleNext: handleNextBase,
    handlePrevious,
    currentHoleData,
    isSaving
  } = useScoreTracking(currentRoundId, selectedCourse?.id);

  // Course selection hook
  const { handleCourseSelect } = useRoundCourseSelection(
    handleCourseSelectBase,
    setCurrentRoundId,
    setHoleScores,
    holeCount
  );

  // Navigation hook
  const { handleNext } = useRoundNavigation(
    handleNextBase,
    handlePrevious,
    currentHole,
    holeCount
  );

  // Round finalization hook
  const { finishRound } = useRoundFinalization(
    baseFinishRound,
    holeScores
  );

  // Update course name when selected course changes
  useEffect(() => {
    updateCourseName(selectedCourse);
  }, [selectedCourse]);

  useEffect(() => {
    let isMounted = true;
    
    const initializeRound = async () => {
      try {
        setIsLoading(true);
        
        // If roundId is provided in URL, use that instead of fetching
        if (urlRoundId) {
          console.log("Using round ID from URL:", urlRoundId);
          setCurrentRoundId(urlRoundId);
          
          // Fetch course name and hole count for the round
          const data = await fetchRoundDetails(urlRoundId);
          
          if (data?.golf_courses?.name && isMounted) {
            setCourseName(data.golf_courses.name);
            console.log("Set course name:", data.golf_courses.name);
          }
          
          if (data?.hole_count && isMounted) {
            setHoleCount(data.hole_count);
            console.log("Set hole count:", data.hole_count);
          }
        } else {
          try {
            console.log("No roundId in URL, fetching in-progress round");
            const roundData = await fetchInProgressRound();
            if (roundData && isMounted) {
              setCurrentRoundId(roundData.roundId);
              setHoleScores(roundData.holeScores);
              setHoleCount(roundData.holeCount || 18);
              setCourseName(roundData.course?.name || null);
              console.log("Fetched in-progress round:", roundData.roundId);
            } else {
              console.log("No in-progress round found");
            }
          } catch (error) {
            console.error("Error fetching in-progress round:", error);
            toast({
              title: "Error loading round",
              description: "Could not load in-progress round. Please try again.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Error initializing round:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log("Loading complete, isLoading set to false");
        }
      }
    };

    initializeRound();
    
    // Retry initializing if we're still loading after 5 seconds
    const retryTimer = setTimeout(() => {
      if (isLoading && isMounted && initAttempt < 2) {
        console.log("Retrying initialization");
        setInitAttempt(prev => prev + 1);
      }
    }, 5000);
    
    return () => {
      isMounted = false;
      clearTimeout(retryTimer);
    };
  }, [urlRoundId, user, fetchInProgressRound, setCurrentRoundId, setHoleScores, toast, fetchRoundDetails, initAttempt, isLoading, setInitAttempt]);

  const handleHoleCountSelect = (count: number) => {
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  };

  // Log the current state for debugging
  console.log("useRoundTracking state:", { 
    currentRoundId, 
    urlRoundId, 
    isLoading, 
    courseName,
    selectedCourse: selectedCourse?.name,
    holeCount
  });

  return {
    selectedCourse,
    selectedTee,
    currentHole,
    holeScores,
    handleCourseSelect,
    setSelectedTee,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    currentTeeColor,
    currentHoleData,
    isSaving,
    finishRound,
    holeCount,
    setHoleCount,
    setCurrentRoundId,
    currentRoundId,
    deleteRound,
    courseName,
    isLoading,
    handleHoleCountSelect
  };
};
