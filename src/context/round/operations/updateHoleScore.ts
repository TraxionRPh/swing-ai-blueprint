
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HoleData } from "@/types/round-tracking";

export const useUpdateHoleScore = () => {
  const { toast } = useToast();
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  // Update a hole score
  const updateHoleScore = async (holeData: HoleData, currentRoundId: string | null) => {
    if (!currentRoundId || currentRoundId === 'new') {
      console.error("Cannot save score: No valid round ID");
      return false;
    }
    
    setSaveInProgress(true);
    console.log(`Saving score for hole ${holeData.holeNumber} in round ${currentRoundId}`);
    
    try {
      // Remove any fields not in the database schema
      const { error } = await supabase
        .from('hole_scores')
        .upsert({
          round_id: currentRoundId,
          hole_number: holeData.holeNumber,
          score: holeData.score,
          putts: holeData.putts,
          fairway_hit: holeData.fairwayHit,
          green_in_regulation: holeData.greenInRegulation
        }, {
          onConflict: 'round_id,hole_number'
        });
      
      if (error) {
        console.error("Database error saving hole score:", error.message);
        throw error;
      }
      
      // Verify the save was successful
      const { data: verifyData } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', currentRoundId)
        .eq('hole_number', holeData.holeNumber)
        .single();
        
      if (verifyData) {
        console.log(`Successfully verified save for hole ${holeData.holeNumber}:`, verifyData);
      } else {
        console.warn(`Could not verify save for hole ${holeData.holeNumber}`);
      }
      
      return true;
    } catch (error) {
      console.error("Error updating hole score:", error);
      toast({
        title: "Error Saving Score",
        description: "Could not save hole score. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaveInProgress(false);
    }
  };

  return {
    updateHoleScore,
    saveInProgress
  };
};
