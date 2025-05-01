
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

export const useRoundManagement = (userId: string | undefined) => {
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch any in-progress round
  const fetchInProgressRound = useCallback(async () => {
    if (!userId) return null;
    
    try {
      console.log('Fetching in-progress round for user:', userId);
      
      // Look for the most recent round from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          id,
          hole_count,
          date,
          course_id,
          total_score,
          golf_courses (
            id,
            name,
            city,
            state,
            total_par,
            course_tees (*)
          )
        `)
        .eq('user_id', userId)
        .gte('date', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error('Error fetching in-progress round:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        const round = data[0];
        
        // Set the current round ID
        setCurrentRoundId(round.id);
        
        return {
          roundId: round.id,
          holeCount: round.hole_count,
          course: round.golf_courses,
          totalScore: round.total_score
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error in fetchInProgressRound:', error);
      toast({
        title: 'Error',
        description: 'Failed to load in-progress round data',
        variant: 'destructive'
      });
      return null;
    }
  }, [userId, toast]);
  
  // Create a new round
  const createNewRound = useCallback(async (courseId: string, holeCount: number = 18) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          user_id: userId,
          course_id: courseId,
          date: new Date().toISOString(),
          hole_count: holeCount
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating new round:', error);
        throw error;
      }
      
      console.log('Created new round:', data.id);
      setCurrentRoundId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error in createNewRound:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new round',
        variant: 'destructive'
      });
      return null;
    }
  }, [userId, toast]);
  
  // Finish round and update statistics
  const finishRound = useCallback(async (holeScores: HoleData[], holeCount: number) => {
    if (!currentRoundId) return false;
    
    try {
      console.log('Finishing round:', currentRoundId);
      
      // Calculate totals from hole scores
      const relevantScores = holeScores.slice(0, holeCount);
      const totalScore = relevantScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
      const totalPutts = relevantScores.reduce((sum, hole) => sum + (hole.putts || 0), 0);
      const fairwaysHit = relevantScores.filter(hole => hole.fairwayHit).length;
      const greensInRegulation = relevantScores.filter(hole => hole.greenInRegulation).length;
      
      // Update the round with the final totals
      const { error } = await supabase
        .from('rounds')
        .update({
          total_score: totalScore,
          total_putts: totalPutts,
          fairways_hit: fairwaysHit,
          greens_in_regulation: greensInRegulation,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentRoundId);
        
      if (error) {
        console.error('Error finishing round:', error);
        throw error;
      }
      
      console.log('Round finished successfully:', {
        totalScore,
        totalPutts,
        fairwaysHit,
        greensInRegulation
      });
      
      // Clear the current round ID
      setCurrentRoundId(null);
      
      // Show success message
      toast({
        title: 'Round Completed',
        description: `Your final score: ${totalScore}`,
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Error in finishRound:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete round',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentRoundId, toast]);
  
  // Delete a round
  const deleteRound = useCallback(async (roundId: string) => {
    try {
      console.log('Deleting round:', roundId);
      
      // First delete all hole scores for this round
      const { error: holeScoresError } = await supabase
        .from('hole_scores')
        .delete()
        .eq('round_id', roundId);
        
      if (holeScoresError) {
        console.error('Error deleting hole scores:', holeScoresError);
        throw holeScoresError;
      }
      
      // Then delete the round itself
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);
        
      if (error) {
        console.error('Error deleting round:', error);
        throw error;
      }
      
      console.log('Round deleted successfully');
      
      // Clear current round ID if it matches the deleted round
      if (currentRoundId === roundId) {
        setCurrentRoundId(null);
      }
      
      // Show success message
      toast({
        title: 'Round Deleted',
        description: 'Round has been deleted successfully',
        variant: 'default'
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteRound:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete round',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentRoundId, toast]);
  
  return {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    createNewRound,
    finishRound,
    deleteRound
  };
};
