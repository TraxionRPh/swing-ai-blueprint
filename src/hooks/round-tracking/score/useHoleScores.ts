
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HoleData } from "@/types/round-tracking";

export const useHoleScores = (roundId: string | null) => {
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);

  useEffect(() => {
    if (roundId) {
      fetchHoleScores();
    } else if (holeScores.length === 0) {
      initializeDefaultScores();
    }
  }, [roundId]);

  const fetchHoleScores = async () => {
    try {
      // First get the scores for this round
      const { data: holeScoresData, error: holeScoresError } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', roundId)
        .order('hole_number');

      if (holeScoresError) throw holeScoresError;

      // Get course info to fetch hole data
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select('course_id')
        .eq('id', roundId)
        .single();
        
      if (roundError) throw roundError;
      
      let holeInfo: any[] = [];
      if (roundData?.course_id) {
        console.log('Fetching course holes for course:', roundData.course_id);
        const { data: courseHoles, error: courseHolesError } = await supabase
          .from('course_holes')
          .select('*')
          .eq('course_id', roundData.course_id)
          .order('hole_number');
          
        if (courseHolesError) throw courseHolesError;
        holeInfo = courseHoles || [];
        console.log('Course holes data:', holeInfo);
      }

      const formattedScores = formatHoleScores(holeScoresData || [], holeInfo);
      console.log('Formatted hole scores with course data:', formattedScores);
      setHoleScores(formattedScores);
    } catch (error) {
      console.error('Error fetching hole scores:', error);
      initializeDefaultScores();
    }
  };

  const formatHoleScores = (scores: any[], holeInfo: any[]): HoleData[] => {
    return Array.from({ length: 18 }, (_, i) => {
      const existingHole = scores.find(h => h.hole_number === i + 1);
      const courseHole = holeInfo.find(h => h.hole_number === i + 1);
      
      return {
        holeNumber: i + 1,
        par: courseHole?.par || 4,
        distance: courseHole?.distance_yards || 0,
        score: existingHole?.score || 0,
        putts: existingHole?.putts || 0,
        fairwayHit: existingHole?.fairway_hit || false,
        greenInRegulation: existingHole?.green_in_regulation || false
      };
    });
  };

  const initializeDefaultScores = () => {
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
  };

  return {
    holeScores,
    setHoleScores
  };
};
