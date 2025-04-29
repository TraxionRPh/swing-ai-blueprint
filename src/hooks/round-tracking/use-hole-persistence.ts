
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";
import { updateRoundSummary } from "./score/use-round-summary";

export const useHolePersistence = (roundId: string | null) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveHoleScore = async (holeData: HoleData) => {
    if (!roundId) return;
    
    setIsSaving(true);
    
    // Create a timeout to automatically clear saving state after 10 seconds
    // This prevents the UI from being stuck in a permanent saving state
    const saveTimeout = setTimeout(() => {
      console.log("Auto-clearing save state after timeout");
      setIsSaving(false);
    }, 10000);
    
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
      
      try {
        await updateRoundSummary(roundId, holeData);
      } catch (updateError) {
        console.error('Non-critical error updating round summary:', updateError);
        // Don't throw here, as we've already saved the main data
      }
      
    } catch (error: any) {
      console.error('Error saving hole score:', error);
      // Only show toast for non-network errors to reduce alert fatigue
      if (!(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
        toast({
          title: "Error saving hole score",
          description: "Your score has been saved locally and will sync when connection is restored.",
          variant: "default"
        });
      }
      // Still consider the local update successful
    } finally {
      clearTimeout(saveTimeout);
      setIsSaving(false);
    }
  };

  return {
    saveHoleScore,
    isSaving
  };
};
