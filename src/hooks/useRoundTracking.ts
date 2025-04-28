
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCourseManagement } from "./round-tracking/useCourseManagement";
import { useScoreTracking } from "./round-tracking/useScoreTracking";
import { useRoundManagement } from "./round-tracking/useRoundManagement";
import { Course } from "@/types/round-tracking";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useRoundTracking = () => {
  const { user } = useAuth();
  const [holeCount, setHoleCount] = useState<number | null>(null);
  const { roundId: urlRoundId } = useParams();
  const [isLoading, setIsLoading] = useState(true);  // Start with loading true
  const [courseName, setCourseName] = useState<string | null>(null);
  
  const {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
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

  useEffect(() => {
    const initializeRound = async () => {
      setIsLoading(true);
      try {
        // If roundId is provided in URL, use that instead of fetching
        if (urlRoundId) {
          console.log("Using round ID from URL:", urlRoundId);
          setCurrentRoundId(urlRoundId);
          
          // Fetch course name and hole count for the round
          const { data, error } = await supabase
            .from('rounds')
            .select(`
              hole_count,
              golf_courses:course_id (
                id,
                name,
                city,
                state,
                total_par,
                course_tees (*)
              )
            `)
            .eq('id', urlRoundId)
            .single();
            
          if (error) {
            console.error("Error fetching round data:", error);
            throw error;
          }
          
          if (data?.golf_courses?.name) {
            setCourseName(data.golf_courses.name);
          }
          
          if (data?.hole_count) {
            setHoleCount(data.hole_count);
          }
        } else {
          const roundData = await fetchInProgressRound();
          if (roundData) {
            setCurrentRoundId(roundData.roundId);
            setHoleScores(roundData.holeScores);
            setHoleCount(roundData.holeCount || 18);
            setCourseName(roundData.course?.name || null);
          }
        }
      } catch (error) {
        console.error("Error initializing round:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRound();
  }, [urlRoundId, user, fetchInProgressRound, setCurrentRoundId, setHoleScores]);

  useEffect(() => {
    // Load hole scores when roundId changes
    if (currentRoundId) {
      console.log("Current round ID changed, loading hole scores:", currentRoundId);
    }
  }, [currentRoundId]);

  useEffect(() => {
    // Update course name when selected course changes
    if (selectedCourse) {
      setCourseName(selectedCourse.name);
    }
  }, [selectedCourse]);

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
    setCurrentRoundId,
    currentRoundId,
    deleteRound,
    courseName,
    isLoading
  };
};
