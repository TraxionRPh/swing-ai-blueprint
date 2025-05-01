
import { useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCourseManagement } from "./useCourseManagement";
import { useRoundManagement } from "./useRoundManagement";
import { useRoundDataState } from "./useRoundDataState";
import { useRoundInitialization } from "./useRoundInitialization";
import { useRoundCourseSelection } from "./useRoundCourseSelection";
import { useRoundNavigation } from "./useRoundNavigation";
import { useRoundFinalization } from "./useRoundFinalization";
import { useRoundLoadingState } from "./useRoundLoadingState";
import { useRoundDataPreparation } from "./useRoundDataPreparation";
import { useScoreTracking } from "./score/useScoreTracking";
import { useResumeSession } from "./useResumeSession";

export const useRoundTracking = () => {
  const { user } = useAuth();
  const { roundId: urlRoundId, holeNumber } = useParams();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const initRunRef = useRef(false);
  
  // Debug current state
  console.log("useRoundTracking init - roundId from URL:", urlRoundId);
  console.log("Current path:", location.pathname);
  
  // Round data state management
  const {
    roundsById,
    setRoundsById
  } = useRoundDataState();
  
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
    if (selectedCourse) {
      console.log("Selected course changed:", selectedCourse.name);
      updateCourseName(selectedCourse);
    }
  }, [selectedCourse, updateCourseName]);

  // Fix to ensure we have the right initial hole number from URL
  useEffect(() => {
    if (holeNumber && setCurrentHole) {
      const holeNum = parseInt(holeNumber, 10);
      if (!isNaN(holeNum) && holeNum >= 1 && holeNum <= 18) {
        console.log(`Setting current hole from URL param: ${holeNum}`);
        setCurrentHole(holeNum);
      }
    }
  }, [holeNumber, setCurrentHole]);

  // Initialize the round when the component mounts or round ID changes
  useEffect(() => {
    let isMounted = true;
    
    // Prevent redundant initialization
    if (initRunRef.current && !currentRoundId) {
      return;
    }
    
    initRunRef.current = true;
    
    // Delegate to the useRoundInitializationEffect hook
    useInitializeRoundEffect({
      urlRoundId,
      currentRoundId,
      setCurrentRoundId,
      fetchRoundDetails,
      fetchInProgressRound,
      setCourseName,
      setHoleCount,
      setRoundsById,
      setHoleScores,
      setLoadingStage,
      setError,
      toast,
      isMounted,
      navigate,
      holeNumber
    });
    
    return () => {
      isMounted = false;
    };
  }, [urlRoundId, user, setCurrentRoundId, setHoleScores, toast, fetchRoundDetails, 
      setLoadingStage, setError, fetchInProgressRound, currentRoundId, setCourseName, setHoleCount, 
      setRoundsById, navigate, holeNumber]);

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
    setCurrentHole,
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

// Helper function for initialization logic - pulled out to reduce the main hook complexity
const useInitializeRoundEffect = async ({
  urlRoundId,
  currentRoundId,
  setCurrentRoundId,
  fetchRoundDetails,
  fetchInProgressRound,
  setCourseName,
  setHoleCount,
  setRoundsById,
  setHoleScores,
  setLoadingStage,
  setError,
  toast,
  isMounted,
  navigate,
  holeNumber
}) => {
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
        
        // If we're on a round page but not on a specific hole, redirect to hole 1
        if (urlRoundId && !holeNumber && navigate) {
          console.log("No hole number in URL, redirecting to hole 1");
          navigate(`/rounds/${urlRoundId}/1`, { replace: true });
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
            
            // If we found an in-progress round, navigate to it
            if (navigate) {
              const holeToNavigate = roundData.currentHole || 1;
              navigate(`/rounds/${roundData.roundId}/${holeToNavigate}`, { replace: true });
            }
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
