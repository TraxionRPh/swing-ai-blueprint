import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCourseManagement } from "./round-tracking/useCourseManagement";
import { useRoundManagement } from "./round-tracking/useRoundManagement";
import { useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useRoundInitialization } from "./round-tracking/useRoundInitialization";
import { useRoundCourseSelection } from "./round-tracking/useRoundCourseSelection";
import { useRoundNavigation } from "./round-tracking/useRoundNavigation";
import { useRoundFinalization } from "./round-tracking/useRoundFinalization";
import { useRoundLoadingState } from "./round-tracking/useRoundLoadingState";
import { useRoundDataPreparation } from "./round-tracking/useRoundDataPreparation";
import { useScoreTracking } from "./round-tracking/useScoreTracking";
import { useResumeSession } from "./round-tracking/useResumeSession";
import type { HoleData, Course } from "@/types/round-tracking";

// Define an interface for round data by ID
interface RoundsByIdType {
  [key: string]: any; // Replace 'any' with a more specific type if available
}

export const useRoundTracking = () => {
  const { user } = useAuth();
  const { roundId: urlRoundId } = useParams();
  const { toast } = useToast();
  const location = useLocation();
  const initRunRef = useRef(false);
  
  // Add state for storing rounds by ID
  const [roundsById, setRoundsById] = useState<RoundsByIdType>({});
  
  // Debug current state
  console.log("useRoundTracking init - roundId from URL:", urlRoundId);
  console.log("Current path:", location.pathname);
  
  // Round management hook
  const {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound: baseFinishRound,
    deleteRound
  } = useRoundManagement(user);

  // Centralized loading state
  const {
    isLoading,
    loadingStage,
    setLoadingStage,
    setError
  } = useRoundLoadingState(currentRoundId);

  // Round initialization hook
  const {
    courseName,
    setCourseName,
    holeCount,
    setHoleCount,
    fetchRoundDetails,
    updateCourseName
  } = useRoundInitialization(user, currentRoundId, setCurrentRoundId);

  // Course management hook
  const {
    selectedCourse,
    selectedTee,
    setSelectedTee,
    handleCourseSelect: handleCourseSelectBase,
    currentTeeColor
  } = useCourseManagement(currentRoundId);

  // Round data preparation hook
  const {
    holeScores,
    setHoleScores
  } = useRoundDataPreparation({
    roundId: currentRoundId,
    courseId: selectedCourse?.id,
    setLoadingStage
  });

  // Score tracking hook with simplified dependencies
  const {
    currentHole,
    handleHoleUpdate,
    handleNext: handleNextBase,
    handlePrevious: handlePreviousBase,
    isSaving,
    currentHoleData,
    setCurrentHole
  } = useScoreTracking(currentRoundId, selectedCourse?.id, holeScores, setHoleScores);

  // Course selection hook
  const { handleCourseSelect } = useRoundCourseSelection(
    handleCourseSelectBase,
    setCurrentRoundId,
    setHoleScores,
    holeCount
  );

  // Round navigation hook
  const { handleNext, handlePrevious } = useRoundNavigation(
    handleNextBase,
    handlePreviousBase,
    currentHole,
    holeCount,
    isLoading
  );

  // Session resumption hook
  const { getResumeHole } = useResumeSession({
    currentHole,
    holeCount,
    roundId: currentRoundId
  });

  // Round finalization hook
  const { finishRound } = useRoundFinalization(
    baseFinishRound,
    holeScores
  );

  // Update course name when selected course changes
  useEffect(() => {
    updateCourseName(selectedCourse);
  }, [selectedCourse, updateCourseName]);

  // Initialize the round when the component mounts or round ID changes
  useEffect(() => {
    let isMounted = true;
    
    // Prevent redundant initialization
    if (initRunRef.current && !currentRoundId) {
      return;
    }
    
    initRunRef.current = true;
    
    const initializeRound = async () => {
      try {
        setLoadingStage('initializing');
        
        // If roundId is provided in URL, use that instead of fetching
        if (urlRoundId) {
          console.log("Using round ID from URL:", urlRoundId);
          setCurrentRoundId(urlRoundId);
          
          // Fetch course name and hole count for the round
          try {
            const data = await fetchRoundDetails(urlRoundId);
            
            if (data?.golf_courses?.name && isMounted) {
              setCourseName(data.golf_courses.name);
              console.log("Set course name:", data.golf_courses.name);
            }
            
            if (data?.hole_count && isMounted) {
              setHoleCount(data.hole_count);
              console.log("Set hole count:", data.hole_count);
            }
            
            // Store round data in the roundsById object
            if (data && isMounted) {
              setRoundsById(prev => ({
                ...prev,
                [urlRoundId]: data
              }));
              console.log("Set round data for ID:", urlRoundId);
            }
            
            setLoadingStage('preparing');
          } catch (error) {
            console.error("Error fetching round details:", error);
            setError("Could not load round details");
            
            // Show toast for user feedback
            toast({
              title: "Error loading round",
              description: "Could not load round details. Please try again.",
              variant: "destructive"
            });
          }
        } else if (!currentRoundId) {
          try {
            console.log("No roundId in URL, fetching in-progress round");
            const roundData = await fetchInProgressRound();
            
            if (roundData && isMounted) {
              setCurrentRoundId(roundData.roundId);
              setHoleScores(roundData.holeScores);
              setHoleCount(roundData.holeCount || 18);
              setCourseName(roundData.course?.name || null);
              
              // Store round data in the roundsById object
              if (roundData.roundId) {
                setRoundsById(prev => ({
                  ...prev,
                  [roundData.roundId]: roundData
                }));
                console.log("Set round data for in-progress round:", roundData.roundId);
              }
              
              console.log("Fetched in-progress round:", roundData.roundId);
              setLoadingStage('preparing');
            } else {
              console.log("No in-progress round found");
              setLoadingStage('ready');
            }
          } catch (error) {
            console.error("Error fetching in-progress round:", error);
            setError("Could not load in-progress round");
            toast({
              title: "Error loading round",
              description: "Could not load in-progress round. Please try again.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Error initializing round:", error);
        setError("Failed to initialize round");
      }
    };

    initializeRound();
    
    return () => {
      isMounted = false;
    };
  }, [urlRoundId, user, setCurrentRoundId, setHoleScores, toast, fetchRoundDetails, 
      setLoadingStage, setError, fetchInProgressRound, currentRoundId, setCourseName, setHoleCount]);

  // Handle hole count selection and storage
  const handleHoleCountSelect = (count: number) => {
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  };

  // Return all the hooks and state needed for round tracking
  return {
    selectedCourse,
    selectedTee,
    currentHole,
    setCurrentHole, // Ensure this is exposed properly
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
    handleHoleCountSelect,
    roundsById,
    error: loadingStage === 'failed' ? 'Failed to load round data' : null
  };
};
