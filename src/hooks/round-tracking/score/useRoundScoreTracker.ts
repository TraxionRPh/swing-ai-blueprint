
import { useState, useCallback, useEffect } from "react";
import { useHoleNavigation } from "./useHoleNavigation";
import { useHolePersistence } from "./useHolePersistence";
import { useHoleScores } from "./useHoleScores";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHoleDataFetcher } from "./use-hole-data-fetcher"; 
import type { HoleData } from "@/types/round-tracking";

export const useRoundScoreTracker = (
  roundId: string | null,
  courseId?: string,
  teeId?: string
) => {
  const { currentHole, setCurrentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { saveHoleScore, isSaving, saveSuccess, saveError } = useHolePersistence(roundId);
  const { holeScores, setHoleScores } = useHoleScores(roundId);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { fetchHoleScoresFromRound, fetchHoleScoresFromCourse, fetchCourseHolesData } = useHoleDataFetcher();

  // Fetch hole data when the component mounts or when roundId/courseId/teeId changes
  useEffect(() => {
    if (!roundId && !courseId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching hole data for round ${roundId} or course ${courseId}`);
        console.log(`Using tee ID: ${teeId || 'none'}`);
        
        // Skip database fetching for "new" rounds with course ID
        if (roundId === 'new' && courseId) {
          console.log('Creating hole data for new round with course data');
          const courseHoles = await fetchCourseHolesData(courseId);
          const holeData = await fetchHoleScoresFromCourse(courseId, teeId || undefined);
          setHoleScores(holeData);
          setIsLoading(false);
          return;
        }
        
        // If we have a valid round ID, fetch hole scores for that round
        if (roundId && roundId !== 'new') {
          console.log(`Fetching hole data for existing round: ${roundId}`);
          const result = await fetchHoleScoresFromRound(roundId);
          if (result?.formattedScores) {
            setHoleScores(result.formattedScores);
          }
        } 
        // If no round ID but we have a course ID, just fetch course holes
        else if (courseId) {
          console.log(`Fetching hole data for course: ${courseId} with tee: ${teeId || 'none'}`);
          const holeData = await fetchHoleScoresFromCourse(courseId, teeId || undefined);
          setHoleScores(holeData);
        }
      } catch (error) {
        console.error('Error fetching hole data:', error);
        toast({
          title: "Error loading hole data",
          description: "Could not load hole scores. Using default values.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roundId, courseId, teeId, fetchHoleScoresFromRound, fetchHoleScoresFromCourse, fetchCourseHolesData, setHoleScores, toast]);

  // Get the current hole data
  const currentHoleData = holeScores.find(hole => hole.holeNumber === currentHole) || {
    holeNumber: currentHole,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false
  };

  // Handle updating a hole's score data
  const handleHoleUpdate = useCallback((data: HoleData) => {
    const updatedScores = [...holeScores];
    const holeIndex = updatedScores.findIndex(hole => hole.holeNumber === data.holeNumber);
    
    if (holeIndex >= 0) {
      updatedScores[holeIndex] = data;
    } else {
      updatedScores.push(data);
    }
    
    setHoleScores(updatedScores);
    
    // Save to database if we have a roundId
    if (roundId && roundId !== 'new') {
      saveHoleScore(data);
    }
  }, [holeScores, setHoleScores, roundId, saveHoleScore]);

  const clearResumeData = useCallback(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
  }, []);

  return {
    currentHole,
    setCurrentHole,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    saveSuccess,
    saveError,
    isLoading,
    currentHoleData,
    clearResumeData,
    fetchCourseHoles: fetchCourseHolesData
  };
};
