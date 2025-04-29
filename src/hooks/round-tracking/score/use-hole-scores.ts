
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HoleData } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";
import { formatHoleScores, initializeDefaultScores } from "./use-hole-data-formatter";

export const useHoleScores = (roundId: string | null, courseId?: string) => {
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRetries = useRef(3);
  const retryCount = useRef(0);

  const fetchHoleScoresFromRound = useCallback(async (roundId: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching hole scores for round:', roundId);
      
      // First get the scores for this round
      const { data: holeScoresData, error: holeScoresError } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', roundId)
        .order('hole_number');

      if (holeScoresError) {
        console.error('Error fetching hole scores:', holeScoresError);
        throw holeScoresError;
      }

      // Get course info to fetch hole data
      let roundData = null;
      let courseId = null;
      let holeCount = 18;
      
      try {
        const roundResponse = await supabase
          .from('rounds')
          .select('course_id, hole_count')
          .eq('id', roundId)
          .maybeSingle();
          
        if (roundResponse.error) {
          console.error('Error fetching round data:', roundResponse.error);
        } else {
          roundData = roundResponse.data;
          courseId = roundData?.course_id;
          holeCount = roundData?.hole_count || 18;
        }
      } catch (roundError) {
        console.error('Failed to fetch round data:', roundError);
        // Continue with default values
      }
      
      let holeInfo: any[] = [];
      
      if (courseId) {
        try {
          console.log('Fetching course holes for course (from round):', courseId);
          const courseHolesResponse = await supabase
            .from('course_holes')
            .select('*')
            .eq('course_id', courseId)
            .order('hole_number');
            
          if (courseHolesResponse.error) {
            console.error('Error fetching course holes:', courseHolesResponse.error);
          } else {
            holeInfo = courseHolesResponse.data || [];
            console.log('Course holes data (from round):', holeInfo);
          }
        } catch (courseError) {
          console.error('Failed to fetch course holes:', courseError);
          // Continue with empty hole info
        }
      }

      const formattedScores = formatHoleScores(holeScoresData || [], holeInfo, holeCount);
      console.log('Formatted hole scores with course data (from round):', formattedScores);
      setHoleScores(formattedScores);
      
      return { formattedScores, holeCount };
    } catch (error) {
      console.error('Error fetching hole scores from round:', error);
      
      // Only show toast for non-network errors to reduce alert fatigue
      if (!(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
        toast({
          title: "Error loading round data",
          description: "Could not load hole scores. Please try again.",
          variant: "destructive"
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchHoleScoresFromCourse = useCallback(async (courseId: string) => {
    setIsLoading(true);
    try {
      console.log('Directly fetching course holes for course:', courseId);
      
      // Get course hole data directly
      const { data: courseHoles, error: courseHolesError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
        
      if (courseHolesError) {
        console.error('Error fetching course holes:', courseHolesError);
        throw courseHolesError;
      }
      
      const holeInfo = courseHoles || [];
      console.log('Course holes data (direct):', holeInfo);

      const formattedScores = formatHoleScores([], holeInfo);
      console.log('Formatted hole scores with course data (direct):', formattedScores);
      setHoleScores(formattedScores);
      return formattedScores;
    } catch (error) {
      console.error('Error fetching hole scores from course:', error);
      return initializeDefaultScores();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reset retry count when roundId or courseId changes
    retryCount.current = 0;
    
    const fetchData = async () => {
      if (roundId) {
        try {
          console.log("Attempting to fetch hole scores for round:", roundId);
          await fetchHoleScoresFromRound(roundId);
        } catch (error) {
          console.error('Failed to fetch hole scores in useEffect:', error);
          
          // If we haven't exceeded max retries, try again
          if (retryCount.current < maxRetries.current) {
            retryCount.current++;
            
            // Clear any existing timeout
            if (fetchTimeoutRef.current) {
              clearTimeout(fetchTimeoutRef.current);
            }
            
            // Set exponential backoff retry (1s, 2s, 4s)
            const retryDelay = Math.pow(2, retryCount.current - 1) * 1000;
            console.log(`Retrying fetch (${retryCount.current}/${maxRetries.current}) after ${retryDelay}ms`);
            
            fetchTimeoutRef.current = setTimeout(() => {
              fetchData();
            }, retryDelay);
          } else {
            initializeDefaultHoleScores();
          }
        }
      } else if (courseId) {
        try {
          await fetchHoleScoresFromCourse(courseId);
        } catch (error) {
          console.error('Failed to fetch course holes in useEffect:', error);
          initializeDefaultHoleScores();
        }
      } else if (holeScores.length === 0) {
        initializeDefaultHoleScores();
      }
    };
    
    fetchData();
    
    // Cleanup function to clear any timeouts
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [roundId, courseId, fetchHoleScoresFromRound, fetchHoleScoresFromCourse, holeScores.length]);

  // Debug the initial state
  useEffect(() => {
    console.log("Initial hole scores state:", { holeScores, isLoading });
  }, []);

  const initializeDefaultHoleScores = (holeCount: number = 18) => {
    const defaultScores = initializeDefaultScores(holeCount);
    console.log("Setting default hole scores:", defaultScores);
    setHoleScores(defaultScores);
  };

  return {
    holeScores,
    setHoleScores,
    isLoading,
    fetchHoleScoresFromRound
  };
};
