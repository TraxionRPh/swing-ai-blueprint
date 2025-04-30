
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";
import { updateRoundSummary } from "./use-round-summary";

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
