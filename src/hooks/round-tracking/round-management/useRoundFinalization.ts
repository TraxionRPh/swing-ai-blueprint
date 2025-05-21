
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import type { HoleData } from "@/types/round-tracking";

export const useRoundFinalization = () => {
  const { toast } = useToast();
  const { user } = useAuth();

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

    if (!roundId || roundId === "new") {
      console.error("Cannot finish round: Invalid round ID");
      toast({
        title: "Error Saving Round",
        description: "Round ID is missing or invalid.",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log(`Finishing round ${roundId} with ${holeCount} holes`);
      
      // Calculate totals, excluding par 3s from fairway counts
      const totalScore = holeScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
      const totalPutts = holeScores.reduce((sum, hole) => sum + (hole.putts || 0), 0);
      
      // Only count fairways hit on non-par 3 holes
      const fairwayEligibleHoles = holeScores.filter(hole => hole.par && hole.par > 3);
      const fairwaysHit = fairwayEligibleHoles.filter(hole => hole.fairwayHit).length;
      
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
        .eq('id', roundId);
        
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
  }, [toast, user]);

  return { finishRound };
};
