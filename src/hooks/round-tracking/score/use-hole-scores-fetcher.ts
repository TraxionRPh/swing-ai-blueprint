
import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";
import { formatHoleScores, initializeDefaultScores } from "./use-hole-data-formatter";

export const useHoleScoresFetcher = () => {
  const { toast } = useToast();
  const isMountedRef = useRef(true);

  const fetchHoleScoresFromRound = useCallback(async (roundId: string) => {
    if (!isMountedRef.current) return null;
    
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
    }
  }, [toast]);

  const fetchHoleScoresFromCourse = useCallback(async (courseId: string) => {
    if (!isMountedRef.current) return null;
    
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
      
      return formattedScores;
    } catch (error) {
      console.error('Error fetching hole scores from course:', error);
      return initializeDefaultScores();
    }
  }, []);

  // Reset the mounted ref on unmount
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);

  // Set the mounted ref to true for new instances
  const initialize = useCallback(() => {
    isMountedRef.current = true;
  }, []);

  return {
    fetchHoleScoresFromRound,
    fetchHoleScoresFromCourse,
    isMountedRef,
    cleanup,
    initialize
  };
};
