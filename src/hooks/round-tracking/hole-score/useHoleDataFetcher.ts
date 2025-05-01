
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
          console.log(`Round ${roundId} is for course ${courseId} with ${holeCount} holes`);
        }
      } catch (roundError) {
        console.error('Failed to fetch round data:', roundError);
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
            console.log(`Found ${holeInfo.length} holes for course ${courseId}`);
            
            if (holeInfo.length > 0) {
              console.log(`Sample hole data - Hole 1: par ${holeInfo[0]?.par}, distance ${holeInfo[0]?.distance_yards}yd`);
            }
          }
        } catch (courseError) {
          console.error('Failed to fetch course holes:', courseError);
        }
      }

      const formattedScores = formatHoleScores(holeScoresData || [], holeInfo, holeCount);
      console.log('Formatted hole scores with course data (from round):', formattedScores.length);
      
      return { holeCount, formattedScores, courseId };
    } catch (error) {
      console.error('Error fetching hole scores from round:', error);
      toast({
        title: "Error loading round data",
        description: "Could not load hole scores. Using default values.",
        variant: "destructive"
      });
      
      return { 
        holeCount: 18, 
        formattedScores: formatHoleScores([], [], 18) 
      };
    }
  }, [toast]);

  const fetchHoleScoresFromCourse = useCallback(async (courseId: string, teeId?: string) => {
    try {
      if (!courseId) {
        console.log('No course ID provided, returning default scores');
        return formatHoleScores([], [], 18);
      }
      
      console.log('Directly fetching course holes for course ID:', courseId);
      
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
      const holeCount = holeInfo.length > 0 ? holeInfo.length : 18;
      
      console.log(`Found ${holeInfo.length} course holes data for course ${courseId}`);
      
      if (holeInfo.length > 0) {
        console.log(`Sample hole data - Hole 1: par ${holeInfo[0]?.par}, distance ${holeInfo[0]?.distance_yards}yd`);
      } else {
        console.log('No course holes found, will use default values');
      }

      const formattedScores = formatHoleScores([], holeInfo, holeCount);
      console.log('Formatted hole scores with course data:', formattedScores);
      
      if (formattedScores.length > 0) {
        console.log(`First formatted hole: par ${formattedScores[0].par}, distance ${formattedScores[0].distance}yd`);
      }
      
      return formattedScores;
    } catch (error) {
      console.error('Error fetching hole scores from course:', error);
      // Return default scores instead of throwing
      return formatHoleScores([], [], 18);
    }
  }, []);

  // Format hole scores with course data
  const formatHoleScores = (scores: any[], holeInfo: any[], holeCount: number = 18, teeId?: string): HoleData[] => {
    console.log(`Formatting ${scores?.length || 0} scores with ${holeInfo?.length || 0} hole infos for ${holeCount} holes`);
    
    if (holeInfo && holeInfo.length > 0) {
      console.log("First hole info:", JSON.stringify(holeInfo[0], null, 2));
    }
    
    return Array.from({ length: holeCount }, (_, i) => {
      const holeNumber = i + 1;
      const existingHole = scores.find(h => h.hole_number === holeNumber);
      const courseHole = holeInfo.find(h => h.hole_number === holeNumber);
      
      if (courseHole) {
        console.log(`Found course hole data for hole ${holeNumber}: par ${courseHole.par}, distance ${courseHole.distance_yards}yd`);
      }
      
      // Always use the direct distance_yards field first
      let distance = courseHole?.distance_yards || 0;
      
      // Only try to use tee-specific distance if available and explicitly requested
      if (teeId && courseHole?.tee_distances && courseHole.tee_distances[teeId]) {
        console.log(`Using tee-specific distance for hole ${holeNumber}: ${courseHole.tee_distances[teeId]}yd`);
        distance = courseHole.tee_distances[teeId];
      }
      
      return {
        holeNumber,
        par: courseHole?.par || 4,
        distance,
        score: existingHole?.score || 0,
        putts: existingHole?.putts || 0,
        fairwayHit: existingHole?.fairway_hit || false,
        greenInRegulation: existingHole?.green_in_regulation || false
      };
    });
  };

  // Initialize default scores
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

  // Helper function to validate UUID format
  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  return {
    fetchHoleScoresFromRound,
    fetchHoleScoresFromCourse,
    initializeDefaultScores,
    formatHoleScores
  };
};
