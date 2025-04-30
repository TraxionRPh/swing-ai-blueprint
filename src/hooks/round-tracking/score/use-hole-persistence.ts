
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

export const useHolePersistence = (roundId: string | null) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveHoleScore = async (holeData: HoleData) => {
    if (!roundId) return;
    if (!holeData.score && holeData.score !== 0) return; // Don't save if no score
    
    console.log(`Saving hole ${holeData.holeNumber} data:`, JSON.stringify(holeData));
    setIsSaving(true);
    try {
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
      
      // Only update round summary after successful save of hole data
      await updateRoundSummary(roundId, holeData);
      console.log(`Successfully saved hole ${holeData.holeNumber} data`);
      
    } catch (error: any) {
      console.error('Error saving hole score:', error);
      toast({
        title: "Error saving hole score",
        description: error.message || "Could not save your progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Add a slight delay before removing the saving indicator
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  return {
    saveHoleScore,
    isSaving
  };
};

// Helper function to update the round summary
async function updateRoundSummary(roundId: string, holeData: HoleData) {
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
}
