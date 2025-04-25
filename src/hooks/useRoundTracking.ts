
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCourseManagement } from "./round-tracking/useCourseManagement";
import { useScoreTracking } from "./round-tracking/useScoreTracking";
import { useRoundManagement } from "./round-tracking/useRoundManagement";
import { Course } from "@/types/round-tracking";

export const useRoundTracking = () => {
  const { user } = useAuth();
  const [holeCount, setHoleCount] = useState<number | null>(null);
  
  const {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound: baseFinishRound
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
    currentHoleData,
    isSaving
  } = useScoreTracking(currentRoundId);

  useEffect(() => {
    const initializeRound = async () => {
      const roundData = await fetchInProgressRound();
      if (roundData) {
        setCurrentRoundId(roundData.roundId);
        setHoleScores(roundData.holeScores);
        setHoleCount(roundData.holeCount || 18);
      }
    };

    initializeRound();
  }, [user]);

  const handleCourseSelect = async (course: Course) => {
    // We always want to use the holeCount that's already been set
    const newRoundId = await handleCourseSelectBase(course, holeCount || 18);
    if (newRoundId) {
      setCurrentRoundId(newRoundId);
      // Create default holes based on the selected hole count
      const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        par: 4,
        distance: 0,
        score: 0,
        putts: 0,
        fairwayHit: false,
        greenInRegulation: false
      }));
      setHoleScores(defaultHoles);
    }
  };

  const handleNext = () => {
    if (holeCount && currentHole === holeCount) {
      return;
    } else {
      handleNextBase();
    }
  };

  const finishRound = async () => {
    if (!holeCount) return false;
    return baseFinishRound(holeScores.slice(0, holeCount), holeCount);
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
    isSaving,
    finishRound,
    holeCount,
    setHoleCount,
    setCurrentRoundId
  };
};
