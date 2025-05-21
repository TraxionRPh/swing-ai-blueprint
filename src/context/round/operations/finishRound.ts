import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFinishRound = () => {
  const { toast } = useToast();
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  // Finish the round and calculate totals
  const finishRound = async (currentRoundId: string | null) => {
    if (!currentRoundId || currentRoundId === 'new') {
      toast({
        title: "Cannot Finish Round",
        description: "Round must be saved first",
        variant: "destructive"
      });
      return false;
    }
    
    setSaveInProgress(true);
    
    try {
      // Calculate totals from existing scores
      const { data: holeScoresData, error: fetchError } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', currentRoundId);
        
      if (fetchError) throw fetchError;
      
      const completedScores = holeScoresData || [];
      
      // Calculate totals - only count values that actually exist
      const totals = completedScores.reduce((acc, hole) => ({
        score: acc.score + (hole.score || 0),
        putts: acc.putts + (hole.putts || 0),
        fairways: acc.fairways + (hole.fairway_hit ? 1 : 0),
        greens: acc.greens + (hole.green_in_regulation ? 1 : 0),
      }), { score: 0, putts: 0, fairways: 0, greens: 0 });
      
      // Update round totals
      const { error } = await supabase
        .from('rounds')
        .update({
          total_score: totals.score,
          total_putts: totals.putts,
          fairways_hit: totals.fairways,
          greens_in_regulation: totals.greens,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentRoundId);
        
      if (error) throw error;
      
      toast({
        title: "Round Completed",
        description: `Your round has been saved successfully with a score of ${totals.score}`,
      });
      
      // Clear session storage so it doesn't auto-resume this round
      try {
        sessionStorage.removeItem('resume-hole-number');
        sessionStorage.removeItem('current-hole-number');
        // Keep current-round-id for history purposes
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
      
      return true;
    } catch (error) {
      console.error("Error finishing round:", error);
      toast({
        title: "Error Saving Round",
        description: "Could not save round data. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaveInProgress(false);
    }
  };

  return {
    finishRound,
    saveInProgress
  };
};
