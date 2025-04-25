
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCourseManagement } from "./round-tracking/useCourseManagement";
import { useScoreTracking } from "./round-tracking/useScoreTracking";
import { useRoundManagement } from "./round-tracking/useRoundManagement";

export const useRoundTracking = () => {
  const { user } = useAuth();
  const {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound
  } = useRoundManagement(user);

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
    currentHoleData
  } = useScoreTracking(currentRoundId);

  useEffect(() => {
    const initializeRound = async () => {
      const roundData = await fetchInProgressRound();
      if (roundData) {
        setCurrentRoundId(roundData.roundId);
        setHoleScores(roundData.holeScores);
      }
    };

    initializeRound();
  }, [user]);

  const handleCourseSelect = async (course: Course) => {
    const newRoundId = await handleCourseSelectBase(course);
    if (newRoundId) setCurrentRoundId(newRoundId);
  };

  const handleNext = () => {
    if (currentHole === 18) {
      finishRound(holeScores);
    } else {
      handleNextBase();
    }
  };

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
  };
};
