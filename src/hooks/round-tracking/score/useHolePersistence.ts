
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

export const useHolePersistence = (roundId: string | null) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveHoleScore = async (holeData: HoleData) => {
    // Don't try to save if we don't have a valid round ID
    if (!roundId || roundId === 'new' || !validateUUID(roundId)) {
      console.log(`Not saving hole data - invalid round ID: ${roundId}`);
      return;
    }
    
    setIsSaving(true);
    try {
      console.log(`Saving hole ${holeData.holeNumber} data for round ${roundId}`);
      
      const { error } = await supabase
        .from('hole_scores')
        .upsert({
          round_id: roundId,
          hole_number: holeData.holeNumber,
          score: holeData.score,
          putts: holeData.putts,
          fairway_hit: holeData.fairwayHit,
          green_in_regulation: holeData.greenInRegulation
        }, {
          onConflict: 'round_id,hole_number'
        });

      if (error) throw error;
      
      await updateRoundSummary(roundId, holeData);
      
    } catch (error: any) {
      console.error('Error saving hole score:', error);
      toast({
        title: "Error saving hole score",
        description: error.message || "Could not save your progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateRoundSummary = async (roundId: string, holeData: HoleData) => {
    try {
      const { data: roundData } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', roundId);
        
      if (!roundData) return;

      // Calculate totals from all holes
      const totals = roundData.reduce((acc, hole) => ({
        score: acc.score + (hole.score || 0),
        putts: acc.putts + (hole.putts || 0),
        fairways: acc.fairways + (hole.fairway_hit ? 1 : 0),
        greens: acc.greens + (hole.green_in_regulation ? 1 : 0),
      }), { score: 0, putts: 0, fairways: 0, greens: 0 });
      
      await supabase
        .from('rounds')
        .update({
          total_score: null, // Keep it null until round is finished
          total_putts: null,
          fairways_hit: totals.fairways,
          greens_in_regulation: totals.greens,
          updated_at: new Date().toISOString()
        })
        .eq('id', roundId);
        
    } catch (error) {
      console.error('Error updating round summary:', error);
    }
  };

  // Helper function to validate UUID format
  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  return {
    saveHoleScore,
    isSaving
  };
};
