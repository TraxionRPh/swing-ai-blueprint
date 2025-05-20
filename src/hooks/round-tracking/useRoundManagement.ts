
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import type { HoleData } from "@/types/round-tracking";

export const useRoundManagement = () => {
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const { toast } = useToast();
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
        par: score.par || 4,
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

  // Finalize and save a round
  const finishRound = useCallback(async (
    holeScores: HoleData[], 
    holeCount: number, 
    roundId?: string | null
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your round",
        variant: "destructive"
      });
      return false;
    }

    const targetRoundId = roundId || currentRoundId;
    
    if (!targetRoundId || targetRoundId === "new") {
      console.error("Cannot finish round: Invalid round ID");
      toast({
        title: "Error Saving Round",
        description: "Round ID is missing or invalid.",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log(`Finishing round ${targetRoundId} with ${holeCount} holes`);
      
      // Calculate totals
      const totalScore = holeScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
      const totalPutts = holeScores.reduce((sum, hole) => sum + (hole.putts || 0), 0);
      const fairwaysHit = holeScores.filter(hole => hole.fairwayHit).length;
      const greensInRegulation = holeScores.filter(hole => hole.greenInRegulation).length;
      
      // Update the round with calculated totals
      const { error } = await supabase
        .from('rounds')
        .update({
          total_score: totalScore,
          total_putts: totalPutts,
          fairways_hit: fairwaysHit,
          greens_in_regulation: greensInRegulation,
          hole_count: holeCount
        })
        .eq('id', targetRoundId);
        
      if (error) {
        console.error("Error saving round:", error);
        toast({
          title: "Error Saving Round",
          description: "Could not save round totals. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Round Completed",
        description: "Your round has been saved successfully!",
      });
      
      // Clear any session storage data used for this round
      sessionStorage.removeItem('resume-hole-number');
      sessionStorage.removeItem('force-resume');
      
      return true;
    } catch (error) {
      console.error("Error in finishRound:", error);
      toast({
        title: "Error Saving Round",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [currentRoundId, toast, user]);

  // Delete a round
  const deleteRound = useCallback(async (roundId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete a round",
        variant: "destructive"
      });
      return false;
    }

    try {
      // First delete all hole scores for this round
      const { error: scoresError } = await supabase
        .from('hole_scores')
        .delete()
        .eq('round_id', roundId);
        
      if (scoresError) {
        console.error("Error deleting hole scores:", scoresError);
        toast({
          title: "Error Deleting Round",
          description: "Could not delete hole scores. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      // Then delete the round itself
      const { error: roundError } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);
        
      if (roundError) {
        console.error("Error deleting round:", roundError);
        toast({
          title: "Error Deleting Round",
          description: "Could not delete round. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Round Deleted",
        description: "Your round has been deleted successfully!",
      });
      
      return true;
    } catch (error) {
      console.error("Error in deleteRound:", error);
      toast({
        title: "Error Deleting Round",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, user]);

  return {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound,
    deleteRound
  };
};
