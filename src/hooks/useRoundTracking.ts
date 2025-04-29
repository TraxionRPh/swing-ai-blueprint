
import { useAuth } from "@/context/AuthContext";
import { useCourseManagement } from "./round-tracking/useCourseManagement";
import { useScoreTracking } from "./round-tracking/useScoreTracking";
import { useRoundManagement } from "./round-tracking/useRoundManagement";
import { useParams, useLocation } from "react-router-dom";
import { useRoundInitialization } from "./round-tracking/useRoundInitialization";
import { useRoundCourseSelection } from "./round-tracking/useRoundCourseSelection";
import { useRoundNavigation } from "./round-tracking/useRoundNavigation";
import { useRoundFinalization } from "./round-tracking/useRoundFinalization";
import { useRoundLoadingState } from "./round-tracking/useRoundLoadingState";
import { useRoundCourseInfo } from "./round-tracking/useRoundCourseInfo";
import { useRoundDataPreparation } from "./round-tracking/useRoundDataPreparation";

export const useRoundTracking = () => {
  const { user } = useAuth();
  const { roundId: urlRoundId } = useParams();
  const location = useLocation();
  
  // Debug current state
  console.log("useRoundTracking init - roundId from URL:", urlRoundId);
  console.log("Current path:", location.pathname);
  
  // Use our new smaller hooks
  const { isLoading, retryLoading } = useRoundLoadingState();
  const { courseName, holeCount, setHoleCount, handleHoleCountSelect } = useRoundCourseInfo();
  
  // Prepare round data
  const {
    currentRoundId,
    setCurrentRoundId
  } = useRoundDataPreparation(urlRoundId);

  const {
    finishRound: baseFinishRound,
    deleteRound
  } = useRoundManagement(user);

  const {
    selectedCourse,
    selectedTee,
    setSelectedTee,
    handleCourseSelect: handleCourseSelectBase,
    currentTeeColor
  } = useCourseManagement(currentRoundId);

  // Instead of calling useScoreTracking conditionally (which would violate Rules of Hooks),
  // we always call it but might not use its results if we're still loading
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
    handleHoleCountSelect,
    retryLoading
  };
};
