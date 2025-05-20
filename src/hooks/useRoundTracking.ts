
import { useCallback } from "react";
import { useRoundDataState } from "./round-tracking/useRoundDataState";
import { useRoundManagement } from "./round-tracking/useRoundManagement";
import { useRoundLoadingState } from "./round-tracking/useRoundLoadingState";
import { useRoundInitialization } from "./round-tracking/useRoundInitialization";
import { useCourseManagement } from "./round-tracking/useCourseManagement";
import { useRoundDataPreparation } from "./round-tracking/useRoundDataPreparation";
import { useScoreTracking } from "./round-tracking/score/useScoreTracking";
import { useRoundCourseSelection } from "./round-tracking/useRoundCourseSelection";
import { useRoundNavigation } from "./round-tracking/useRoundNavigation";
import { useResumeSession } from "./round-tracking/useResumeSession";
import { useRoundFinalization } from "./round-tracking/useRoundFinalization";
import { useRoundSetup } from "./round-tracking/useRoundSetup";

/**
 * Main hook for round tracking functionality
 * Composes multiple smaller, specialized hooks
 */
export const useRoundTracking = () => {
  // Round data state
  const { roundsById, setRoundsById } = useRoundDataState();
  
  // Round management (CRUD operations)
  const {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound: baseFinishRound,
    deleteRound
  } = useRoundManagement();

  // Loading state management
  const {
    isLoading,
    loadingStage,
    setLoadingStage,
    setError,
    error
  } = useRoundLoadingState(currentRoundId);

  // Round initialization
  const {
    courseName,
    setCourseName,
    holeCount,
    setHoleCount,
    fetchRoundDetails,
    updateCourseName
  } = useRoundInitialization(currentRoundId, setCurrentRoundId);

  // Course management
  const {
    selectedCourse,
    selectedTee,
    setSelectedTee,
    handleCourseSelect: handleCourseSelectBase,
    currentTeeColor
  } = useCourseManagement(currentRoundId);

  // Round data preparation
  const {
    holeScores,
    setHoleScores
  } = useRoundDataPreparation({
    roundId: currentRoundId,
    courseId: selectedCourse?.id,
    setLoadingStage
  });

  // Score tracking
  const {
    currentHole,
    handleHoleUpdate,
    handleNext: handleNextBase,
    handlePrevious: handlePreviousBase,
    isSaving,
    currentHoleData,
    setCurrentHole
  } = useScoreTracking(currentRoundId, selectedCourse?.id, holeScores, setHoleScores);

  // Course selection
  const { handleCourseSelect } = useRoundCourseSelection(
    handleCourseSelectBase,
    setCurrentRoundId,
    setHoleScores,
    holeCount
  );

  // Hole navigation
  const { handleNext, handlePrevious } = useRoundNavigation(
    handleNextBase,
    handlePreviousBase,
    currentHole,
    holeCount,
    isLoading
  );

  // Session resumption
  const { getResumeHole } = useResumeSession({
    currentHole,
    holeCount,
    roundId: currentRoundId
  });

  // Round finalization
  const { finishRound } = useRoundFinalization(
    baseFinishRound,
    holeScores
  );

  // Initialize the round when the component mounts or round ID changes
  useRoundSetup({
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
    updateCourseName,
    selectedCourse
  });

  // Handle hole count selection and storage
  const handleHoleCountSelect = useCallback((count: number) => {
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  }, [setHoleCount]);

  return {
    // Course data
    selectedCourse,
    selectedTee,
    currentTeeColor,
    handleCourseSelect,
    setSelectedTee,
    
    // Hole data
    currentHole,
    setCurrentHole,
    holeScores,
    currentHoleData,
    
    // Hole actions
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    
    // Round data
    currentRoundId,
    setCurrentRoundId,
    courseName,
    holeCount,
    setHoleCount,
    handleHoleCountSelect,
    
    // Round actions
    finishRound,
    deleteRound,
    
    // Status
    isSaving,
    isLoading,
    roundsById,
    error: loadingStage === 'failed' ? 'Failed to load round data' : error
  };
};
