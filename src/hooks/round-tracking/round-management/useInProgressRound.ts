
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { HoleData } from "@/types/round-tracking";

export const useInProgressRound = () => {
  const { user } = useAuth();

  // Fetch an in-progress round for the current user
  const fetchInProgressRound = useCallback(async () => {
    if (!user) {
      console.log("No authenticated user, cannot fetch in-progress round");
      return null;
    }

    try {
      console.log("Fetching in-progress rounds for user:", user.id);
      
      // First, check for recent rounds that might be in progress
      const { data: roundsData, error: roundsError } = await supabase
        .from('rounds')
        .select(`
          id,
          hole_count,
          golf_courses:course_id (
            id,
            name,
            city,
            state
          )
        `)
        .eq('user_id', user.id)
        .is('total_score', null) // Not yet completed
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (roundsError) {
        console.error("Error fetching in-progress rounds:", roundsError);
        return null;
      }
      
      if (!roundsData || roundsData.length === 0) {
        console.log("No in-progress rounds found");
        return null;
      }
      
      console.log("Found in-progress round:", roundsData[0]);
      const roundId = roundsData[0].id;
      
      // Fetch hole scores for this round
      const { data: scoresData, error: scoresError } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', roundId)
        .order('hole_number', { ascending: true });
        
      if (scoresError) {
        console.error("Error fetching hole scores:", scoresError);
      }
      
      // Format hole scores into the HoleData format
      const holeScores = (scoresData || []).map(score => ({
        holeNumber: score.hole_number,
        score: score.score || 0,
        putts: score.putts || 0,
        fairwayHit: score.fairway_hit || false,
        greenInRegulation: score.green_in_regulation || false,
        par: 4, // Default par value since it doesn't exist in the hole_scores table
        distance: 0 // Default distance
      }));
      
      return {
        roundId,
        holeCount: roundsData[0].hole_count || 18,
        course: roundsData[0].golf_courses,
        holeScores
      };
    } catch (error) {
      console.error("Error in fetchInProgressRound:", error);
      return null;
    }
  }, [user]);

  return { fetchInProgressRound };
};
