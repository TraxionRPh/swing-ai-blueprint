
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatHoleScores, initializeDefaultScores } from "./use-hole-data-formatter";
import type { HoleData } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";

export const useHoleDataFetcher = () => {
  const { toast } = useToast();

  /**
   * Fetch hole scores from an existing round
   */
  const fetchHoleScoresFromRound = useCallback(async (roundId: string) => {
    // Special case for new rounds or invalid UUIDs
    if (roundId === 'new' || !validateUUID(roundId)) {
      console.log(`Creating default hole scores for ${roundId === 'new' ? 'new' : 'invalid'} round ID`);
      return { 
        formattedScores: initializeDefaultScores(),
        holeCount: 18 
      };
    }
    
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
      let teeId = null;
      
      try {
        const roundResponse = await supabase
          .from('rounds')
          .select('course_id, hole_count, tee_id')
          .eq('id', roundId)
          .maybeSingle();
          
        if (roundResponse.error) {
          console.error('Error fetching round data:', roundResponse.error);
        } else {
          roundData = roundResponse.data;
          courseId = roundData?.course_id;
          holeCount = roundData?.hole_count || 18;
          teeId = roundData?.tee_id;
          console.log(`Round ${roundId} is for course ${courseId} with ${holeCount} holes, using tee ${teeId}`);
        }
      } catch (roundError) {
        console.error('Failed to fetch round data:', roundError);
      }
      
      let holeInfo = [];
      
      if (courseId) {
        // Fetch course hole data
        const courseHoleData = await fetchCourseHolesData(courseId);
        holeInfo = courseHoleData || [];
      }

      const formattedScores = formatHoleScores(holeScoresData || [], holeInfo, holeCount, teeId);
      console.log('Formatted hole scores with course data (from round):', formattedScores.length);
      
      if (formattedScores.length > 0) {
        console.log(`First formatted hole data:`, formattedScores[0]);
      }
      
      return { 
        holeCount, 
        formattedScores, 
        courseId,
        teeId
      };
    } catch (error) {
      console.error('Error fetching hole scores from round:', error);
      toast({
        title: "Error loading round data",
        description: "Could not load hole scores. Using default values.",
        variant: "destructive"
      });
      
      return { 
        holeCount: 18, 
        formattedScores: initializeDefaultScores()
      };
    }
  }, [toast]);

  // Fetch hole scores from a course ID directly
  const fetchHoleScoresFromCourse = useCallback(async (courseId: string, teeId?: string) => {
    try {
      if (!courseId) {
        console.log('No course ID provided, returning default scores');
        return initializeDefaultScores();
      }
      
      console.log('Fetching course holes for course ID:', courseId, teeId ? `with tee ID: ${teeId}` : '');
      
      // Get course hole data directly
      const holeInfo = await fetchCourseHolesData(courseId);
      const holeCount = holeInfo?.length > 0 ? holeInfo.length : 18;
      
      console.log(`Found ${holeInfo?.length || 0} course holes data for course ${courseId}`);
      
      if (holeInfo?.length > 0) {
        console.log(`Sample hole data - Hole 1: par ${holeInfo[0]?.par}, distance ${holeInfo[0]?.distance_yards}yd`);
      } else {
        console.log('No course holes found, will use default values');
      }

      const formattedScores = formatHoleScores([], holeInfo || [], holeCount, teeId);
      
      if (formattedScores.length > 0) {
        console.log(`First formatted hole from course data:`, formattedScores[0]);
      }
      
      return formattedScores;
    } catch (error) {
      console.error('Error fetching hole scores from course:', error);
      // Return default scores instead of throwing
      return initializeDefaultScores();
    }
  }, []);

  // Helper function to fetch course hole data
  const fetchCourseHolesData = async (courseId: string) => {
    if (!courseId) return [];
    
    try {
      const { data: courseHoles, error: courseHolesError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
        
      if (courseHolesError) {
        console.error('Error fetching course holes:', courseHolesError);
        return [];
      }
      
      return courseHoles || [];
    } catch (error) {
      console.error('Error in fetchCourseHolesData:', error);
      return [];
    }
  };

  // Helper function to validate UUID format
  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  return {
    fetchHoleScoresFromRound,
    fetchHoleScoresFromCourse,
    fetchCourseHolesData,
    initializeDefaultScores
  };
};
