
import { useState, useCallback, useEffect } from "react";
import { useHoleNavigation } from "./useHoleNavigation";
import { useHolePersistence } from "./useHolePersistence";
import { useHoleScores } from "./useHoleScores";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

export const useRoundScoreTracker = (
  roundId: string | null,
  courseId?: string,
  teeId?: string
) => {
  const { currentHole, setCurrentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);
  const { holeScores, setHoleScores } = useHoleScores(roundId);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
        console.log(`Using tee ID: ${teeId}`);
        
        // Skip database fetching for "new" rounds
        if (roundId === 'new') {
          console.log('Creating default hole data for new round');
          const defaultScores = initializeDefaultScores();
          setHoleScores(defaultScores);
          setIsLoading(false);
          return;
        }
        
        // If we have a valid round ID, fetch hole scores for that round
        if (roundId && roundId !== 'new') {
          const { data: scores, error } = await supabase
            .from('hole_scores')
            .select('*')
            .eq('round_id', roundId)
            .order('hole_number');

          if (error) {
            throw error;
          }

          // Get the course ID for this round to fetch hole data
          if (!courseId) {
            const { data: roundData, error: roundError } = await supabase
              .from('rounds')
              .select('course_id, tee_id')
              .eq('id', roundId)
              .single();

            if (!roundError && roundData) {
              const roundCourseId = roundData.course_id;
              const roundTeeId = roundData.tee_id;
              
              if (roundCourseId) {
                await fetchCourseHoles(roundCourseId, scores, roundTeeId);
              }
            }
          } else {
            await fetchCourseHoles(courseId, scores, teeId);
          }
        } 
        // If no round ID but we have a course ID, just fetch course holes
        else if (courseId) {
          await fetchCourseHoles(courseId, [], teeId);
        }
      } catch (error) {
        console.error('Error fetching hole data:', error);
        toast({
          title: "Error loading hole data",
          description: "Could not load hole scores. Using default values.",
          variant: "destructive"
        });
        
        // Create default hole data if fetch fails
        const defaultScores = initializeDefaultScores();
        setHoleScores(defaultScores);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roundId, courseId, teeId, toast, setHoleScores]);

  // Fetch course hole data and merge with scores
  const fetchCourseHoles = useCallback(async (
    courseId: string, 
    scores: any[] = [], 
    teeId?: string
  ) => {
    try {
      console.log(`Fetching course holes for course ${courseId}`);
      
      const { data: holeData, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');

      if (error) {
        throw error;
      }

      console.log(`Found ${holeData?.length || 0} course holes`);
      
      // If we have a teeId, try to get tee-specific distances
      if (teeId) {
        console.log(`Looking for tee-specific distances for teeId: ${teeId}`);
      }
      
      // Merge course holes data with scores
      const mergedData = Array.from({ length: 18 }, (_, i) => {
        const holeNumber = i + 1;
        const courseHole = holeData?.find(h => h.hole_number === holeNumber);
        const scoreData = scores?.find(s => s.hole_number === holeNumber);
        
        // Determine the distance:
        // 1. Try to get tee-specific distance from tee_distances if available
        // 2. Fall back to the default distance_yards
        // 3. Use 0 if nothing is available
        let distance = 0;
        if (courseHole) {
          if (teeId && courseHole.tee_distances && courseHole.tee_distances[teeId]) {
            distance = courseHole.tee_distances[teeId];
            console.log(`Hole ${holeNumber}: Using tee-specific distance ${distance}yd`);
          } else if (courseHole.distance_yards) {
            distance = courseHole.distance_yards;
            console.log(`Hole ${holeNumber}: Using default distance ${distance}yd`);
          }
        }

        return {
          holeNumber,
          par: courseHole?.par || 4,
          distance,
          score: scoreData?.score || 0,
          putts: scoreData?.putts || 0,
          fairwayHit: scoreData?.fairway_hit || false,
          greenInRegulation: scoreData?.green_in_regulation || false
        };
      });

      setHoleScores(mergedData);
      return mergedData;
    } catch (error) {
      console.error('Error fetching course holes:', error);
      return [];
    }
  }, [setHoleScores]);

  // Helper function to create default hole data
  const initializeDefaultScores = (holeCount: number = 18): HoleData[] => {
    return Array.from({ length: holeCount }, (_, i) => ({
      holeNumber: i + 1,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }));
  };

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
    isLoading,
    currentHoleData,
    clearResumeData,
    fetchCourseHoles
  };
};
