
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Course, HoleData } from "@/types/round-tracking";

export const useRoundManagement = (user: any) => {
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInProgressRound = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          id,
          hole_count,
          course_id,
          golf_courses:course_id (
            id,
            name,
            city,
            state
          ),
          hole_scores (*)
        `)
        .eq('user_id', user.id)
        .is('total_score', null)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Get tees for the course
        const courseTeesResponse = data.course_id ? 
          await supabase
            .from('course_tees')
            .select('*')
            .eq('course_id', data.course_id) : null;
            
        if (courseTeesResponse?.error) throw courseTeesResponse.error;
        
        // Get hole information including distance
        const holeInfoResponse = data.course_id ?
          await supabase
            .from('course_holes')
            .select('*')
            .eq('course_id', data.course_id) : null;
            
        if (holeInfoResponse?.error) throw holeInfoResponse.error;
        
        const holeInfo = holeInfoResponse?.data || [];
        
        return {
          roundId: data.id,
          holeCount: data.hole_count || 18,
          course: data.golf_courses ? {
            ...data.golf_courses,
            course_tees: courseTeesResponse?.data || []
          } : null,
          holeScores: data.hole_scores?.map((hole: any) => {
            // Find corresponding hole info to get distance
            const courseHole = holeInfo.find((h: any) => h.hole_number === hole.hole_number);
            
            return {
              holeNumber: hole.hole_number,
              par: courseHole?.par || 4,
              distance: courseHole?.distance_yards || 0,
              score: hole.score,
              putts: hole.putts,
              fairwayHit: hole.fairway_hit,
              greenInRegulation: hole.green_in_regulation
            };
          }) || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching in-progress round:', error);
      return null;
    }
  };

  const finishRound = async (holeScores: HoleData[], holeCount: number) => {
    if (!currentRoundId) return false;

    try {
      // Only consider holes up to the hole count limit
      const relevantScores = holeScores.slice(0, holeCount);
      
      await supabase
        .from('rounds')
        .update({ 
          total_score: relevantScores.reduce((sum, hole) => sum + (hole.score || 0), 0),
          total_putts: relevantScores.reduce((sum, hole) => sum + (hole.putts || 0), 0),
          fairways_hit: relevantScores.filter(hole => hole.fairwayHit).length,
          greens_in_regulation: relevantScores.filter(hole => hole.greenInRegulation).length,
          hole_count: holeCount
        })
        .eq('id', currentRoundId);

      toast({
        title: "Round Completed",
        description: "Your round has been saved successfully!"
      });

      setCurrentRoundId(null);
      return true;
    } catch (error) {
      console.error('Error finishing round:', error);
      toast({
        title: "Error finishing round",
        description: "Could not save round details. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound
  };
};
