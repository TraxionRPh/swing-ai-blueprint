import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Course, HoleData } from "@/types/round-tracking";

export const useRoundManagement = (user: any) => {
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchInProgressRound = async () => {
    if (!user) return null;

    try {
      console.log("Fetching in-progress round for user:", user.id);
      
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
            state,
            total_par
          ),
          hole_scores (*)
        `)
        .eq('user_id', user.id)
        .is('total_score', null)
        .maybeSingle();

      if (error) {
        console.error('Error fetching in-progress round:', error);
        return null;
      }

      console.log("In-progress round data:", data);

      if (data) {
        // Get tees for the course
        let courseTeesData = [];
        try {
          if (data.course_id) {
            const courseTeesResponse = await supabase
              .from('course_tees')
              .select('*')
              .eq('course_id', data.course_id);
              
            if (courseTeesResponse.error) {
              console.error('Error fetching course tees:', courseTeesResponse.error);
            } else {
              courseTeesData = courseTeesResponse.data || [];
            }
          }
        } catch (teesError) {
          console.error('Failed to fetch course tees:', teesError);
          // Continue with what we have
        }
        
        // Get hole information including distance
        let holeInfo = [];
        try {
          if (data.course_id) {
            const holeInfoResponse = await supabase
              .from('course_holes')
              .select('*')
              .eq('course_id', data.course_id);
              
            if (holeInfoResponse.error) {
              console.error('Error fetching hole info:', holeInfoResponse.error);
            } else {
              holeInfo = holeInfoResponse.data || [];
            }
          }
        } catch (holeError) {
          console.error('Failed to fetch hole info:', holeError);
          // Continue with what we have
        }
        
        return {
          roundId: data.id,
          holeCount: data.hole_count || 18,
          course: data.golf_courses ? {
            ...data.golf_courses,
            course_tees: courseTeesData
          } : null,
          holeScores: (data.hole_scores || []).map((hole: any) => {
            // Find corresponding hole info to get distance
            const courseHole = holeInfo.find((h: any) => h.hole_number === hole.hole_number);
            
            return {
              holeNumber: hole.hole_number,
              par: courseHole?.par || 4,
              distance: courseHole?.distance_yards || 0,
              score: hole.score,
              putts: hole.putts,
              fairwayHit: !!hole.fairway_hit,
              greenInRegulation: !!hole.green_in_regulation
            };
          }) || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching in-progress round:', error);
      toast({
        title: "Error loading round",
        description: "Could not load round data. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const finishRound = async (holeScores: HoleData[], holeCount: number, overrideRoundId?: string | null) => {
    // Use the override round ID if provided, otherwise use the current round ID
    const roundIdToUse = overrideRoundId || currentRoundId;
    
    if (!roundIdToUse || isSubmitting) return false;
    
    setIsSubmitting(true);

    try {
      console.log("Finishing round with ID:", roundIdToUse);
      console.log("Hole scores:", holeScores);
      console.log("Hole count:", holeCount);
      
      // Only consider holes up to the hole count limit
      const relevantScores = holeScores.slice(0, holeCount);
      
      // Ensure we have valid numbers for all calculations
      const totalScore = relevantScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
      const totalPutts = relevantScores.reduce((sum, hole) => {
        const puttsValue = typeof hole.putts === 'number' ? hole.putts : 0;
        return sum + puttsValue;
      }, 0);
      const fairwaysHit = relevantScores.filter(hole => hole.fairwayHit).length;
      const greensInRegulation = relevantScores.filter(hole => hole.greenInRegulation).length;
      
      console.log("Calculated round totals:", { 
        totalScore,
        totalPutts,
        fairwaysHit,
        greensInRegulation,
        holeCount
      });
      
      console.log("Submitting round data to Supabase:", {
        totalScore,
        totalPutts,
        fairwaysHit,
        greensInRegulation
      });
      
      const updateResult = await supabase
        .from('rounds')
        .update({ 
          total_score: totalScore,
          total_putts: totalPutts,
          fairways_hit: fairwaysHit,
          greens_in_regulation: greensInRegulation,
          hole_count: holeCount
        })
        .eq('id', roundIdToUse);
        
      if (updateResult.error) {
        console.error('Error updating round:', updateResult.error);
        throw updateResult.error;
      }
      
      console.log("Round successfully updated with final scores:", updateResult);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRound = async (roundId: string) => {
    try {
      // Delete hole scores first due to foreign key constraints
      const { error: holeScoresError } = await supabase
        .from('hole_scores')
        .delete()
        .eq('round_id', roundId);

      if (holeScoresError) throw holeScoresError;

      // Then delete the round
      const { error: roundError } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);

      if (roundError) throw roundError;

      setCurrentRoundId(null);
      
      toast({
        title: "Round Deleted",
        description: "The round has been successfully deleted",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting round:', error);
      toast({
        title: "Error deleting round",
        description: "Could not delete the round. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound,
    deleteRound,
    isSubmitting
  };
};
