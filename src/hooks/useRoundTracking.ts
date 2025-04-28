
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCourseManagement } from "./round-tracking/useCourseManagement";
import { useScoreTracking } from "./round-tracking/useScoreTracking";
import { useRoundManagement } from "./round-tracking/useRoundManagement";
import { Course } from "@/types/round-tracking";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRoundTracking = () => {
  const { user } = useAuth();
  const [holeCount, setHoleCount] = useState<number | null>(null);
  const { roundId: urlRoundId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [courseName, setCourseName] = useState<string | null>(null);
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
    let isMounted = true;
    
    const initializeRound = async () => {
      try {
        // If roundId is provided in URL, use that instead of fetching
        if (urlRoundId) {
          console.log("Using round ID from URL:", urlRoundId);
          setCurrentRoundId(urlRoundId);
          
          // Fetch course name and hole count for the round
          try {
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
            
            if (data?.golf_courses?.name && isMounted) {
              setCourseName(data.golf_courses.name);
              console.log("Set course name:", data.golf_courses.name);
            }
            
            if (data?.hole_count && isMounted) {
              setHoleCount(data.hole_count);
              console.log("Set hole count:", data.hole_count);
            }
          } catch (error) {
            console.error("Error fetching round data:", error);
            toast({
              title: "Error loading round",
              description: "Could not load round data. Please try again.",
              variant: "destructive"
            });
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

    setIsLoading(true);
    initializeRound();
    
    return () => {
      isMounted = false;
    };
  }, [urlRoundId, user, fetchInProgressRound, setCurrentRoundId, setHoleScores, toast]);

  useEffect(() => {
    // Update course name when selected course changes
    if (selectedCourse) {
      setCourseName(selectedCourse.name);
    }
  }, [selectedCourse]);

  const handleCourseSelect = async (course: Course) => {
    // We always want to use the holeCount that's already been set
    try {
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
      return newRoundId;
    } catch (error) {
      console.error("Error selecting course:", error);
      toast({
        title: "Error selecting course",
        description: "Could not create a new round. Please try again.",
        variant: "destructive"
      });
      return null;
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
    isLoading
  };
};
