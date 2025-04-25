
import { useState, useEffect } from "react";
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
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const courseTeesResponse = data.course_id ? 
          await supabase
            .from('course_tees')
            .select('*')
            .eq('course_id', data.course_id) : null;
            
        if (courseTeesResponse?.error) throw courseTeesResponse.error;
        
        return {
          roundId: data.id,
          course: data.golf_courses ? {
            ...data.golf_courses,
            course_tees: courseTeesResponse?.data || []
          } : null,
          holeScores: data.hole_scores?.map((hole: any) => ({
            holeNumber: hole.hole_number,
            par: hole.par || 4,
            distance: hole.distance || 0,
            score: hole.score,
            putts: hole.putts,
            fairwayHit: hole.fairway_hit,
            greenInRegulation: hole.green_in_regulation
          })) || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching in-progress round:', error);
      return null;
    }
  };

  const finishRound = async (holeScores: HoleData[]) => {
    if (!currentRoundId) return;

    try {
      await supabase
        .from('rounds')
        .update({ 
          total_score: holeScores.reduce((sum, hole) => sum + hole.score, 0),
          total_putts: holeScores.reduce((sum, hole) => sum + hole.putts, 0),
          fairways_hit: holeScores.filter(hole => hole.fairwayHit).length,
          greens_in_regulation: holeScores.filter(hole => hole.greenInRegulation).length
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
