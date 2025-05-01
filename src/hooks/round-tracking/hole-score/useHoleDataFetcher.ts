
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HoleData } from "@/types/round-tracking";

export const useHoleDataFetcher = () => {
  
  /**
   * Fetch hole scores from an existing round
   */
  const fetchHoleScoresFromRound = useCallback(async (roundId: string) => {
    if (!roundId || roundId === 'new') {
      // Return default data for new rounds
      return {
        formattedScores: initializeDefaultScores(),
        holeCount: 18
      };
    }
    
    try {
      console.log(`Fetching hole scores for round ${roundId}`);
      
      // Get hole scores and round details 
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select(`
          hole_count,
          course_id,
          tee_id,
          hole_scores(*)
        `)
        .eq('id', roundId)
        .single();
        
      if (roundError) {
        console.error('Error fetching round data:', roundError);
        return null;
      }
      
      if (!roundData) {
        console.log('No round data found');
        return null;
      }
      
      const holeCount = roundData.hole_count || 18;
      const courseId = roundData.course_id;
      const teeId = roundData.tee_id;
      const holeScores = roundData.hole_scores || [];
      
      if (!courseId) {
        // No course ID, just format the data we have
        const formattedScores = Array.from({ length: holeCount }, (_, i) => {
          const holeNumber = i + 1;
          const score = holeScores.find((s: any) => s.hole_number === holeNumber);
          
          return {
            holeNumber,
            par: 4, // Default
            distance: 0, // Default
            score: score?.score || 0,
            putts: score?.putts || 0,
            fairwayHit: score?.fairway_hit || false,
            greenInRegulation: score?.green_in_regulation || false
          };
        });
        
        return { formattedScores, holeCount, courseId, teeId };
      }
      
      // Fetch course holes to get par and distance information
      const { data: courseHoles, error: holesError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
        
      if (holesError) {
        console.error('Error fetching course holes:', holesError);
      }
      
      // Merge the data
      const formattedScores = Array.from({ length: holeCount }, (_, i) => {
        const holeNumber = i + 1;
        const holeData = courseHoles?.find((h: any) => h.hole_number === holeNumber);
        const score = holeScores.find((s: any) => s.hole_number === holeNumber);
        
        // Get distance based on tee or default
        let distance = 0;
        if (holeData) {
          if (teeId && holeData.tee_distances && holeData.tee_distances[teeId]) {
            distance = holeData.tee_distances[teeId];
            console.log(`Hole ${holeNumber}: Using tee-specific distance ${distance}yd`);
          } else {
            distance = holeData.distance_yards || 0;
          }
        }
        
        return {
          holeNumber,
          par: holeData?.par || 4,
          distance: distance,
          score: score?.score || 0,
          putts: score?.putts || 0,
          fairwayHit: score?.fairway_hit || false,
          greenInRegulation: score?.green_in_regulation || false
        };
      });
      
      return { formattedScores, holeCount, courseId, teeId };
      
    } catch (error) {
      console.error('Error in fetchHoleScoresFromRound:', error);
      return null;
    }
  }, []);

  /**
   * Fetch and format hole data from a course
   */
  const fetchHoleScoresFromCourse = useCallback(async (courseId: string, teeId?: string) => {
    if (!courseId) {
      return initializeDefaultScores();
    }
    
    try {
      console.log(`Fetching course holes for course ${courseId}`);
      
      const { data: courseHoles, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
        
      if (error) {
        throw error;
      }
      
      if (!courseHoles || courseHoles.length === 0) {
        console.log('No course holes found, using defaults');
        return initializeDefaultScores();
      }
      
      return courseHoles.map((hole: any): HoleData => {
        // Get distance based on tee or default
        let distance = 0;
        if (teeId && hole.tee_distances && hole.tee_distances[teeId]) {
          distance = hole.tee_distances[teeId];
        } else {
          distance = hole.distance_yards || 0;
        }
        
        return {
          holeNumber: hole.hole_number,
          par: hole.par || 4,
          distance: distance,
          score: 0,
          putts: 0,
          fairwayHit: false,
          greenInRegulation: false
        };
      });
    } catch (error) {
      console.error('Error fetching course holes:', error);
      return initializeDefaultScores();
    }
  }, []);

  /**
   * Initialize default score data
   */
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

  return {
    fetchHoleScoresFromRound,
    fetchHoleScoresFromCourse,
    initializeDefaultScores
  };
};
