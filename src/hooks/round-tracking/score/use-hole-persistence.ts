
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

export const useHolePersistence = (roundId: string | null) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveHoleScore = async (holeData: HoleData) => {
    if (!roundId) {
      console.error('Cannot save hole score: No roundId provided');
      return false;
    }
    
    // Only save if we have a hole number
    if (!holeData.holeNumber) {
      console.error('Cannot save hole score: No hole number provided');
      return false;
    }
    
    console.log(`Saving hole ${holeData.holeNumber} data:`, JSON.stringify(holeData));
    setIsSaving(true);
    
    try {
      // Ensure we have all the required fields for the database
      const dataToSave = {
        round_id: roundId,
        hole_number: holeData.holeNumber,
        score: holeData.score || null,  // Use null instead of 0 for empty values
        putts: holeData.putts || null,  // Use null instead of 0 for empty values
        fairway_hit: !!holeData.fairwayHit,
        green_in_regulation: !!holeData.greenInRegulation
      };
      
      console.log('Saving hole data to database:', dataToSave);
      
      // Fixed issue: removed 'returning' option which doesn't exist in the current API version
      const { error } = await supabase
        .from('hole_scores')
        .upsert(dataToSave, {
          onConflict: 'round_id,hole_number'
        });

      if (error) {
        console.error('Error in supabase upsert:', error);
        throw error;
      }
      
      // Only update round summary after successful save of hole data
      await updateRoundSummary(roundId);
      console.log(`Successfully saved hole ${holeData.holeNumber} data`);
      return true;
      
    } catch (error: any) {
      console.error('Error saving hole score:', error);
      toast({
        title: "Error saving hole score",
        description: error.message || "Could not save your progress. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      // Add a slight delay before removing the saving indicator
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }
  };

  return {
    saveHoleScore,
    isSaving
  };
};

// Helper function to update the round summary
async function updateRoundSummary(roundId: string) {
  try {
    console.log('Updating round summary for round:', roundId);
    
    const { data: holeScores, error: fetchError } = await supabase
      .from('hole_scores')
      .select('*')
      .eq('round_id', roundId);
      
    if (fetchError) {
      console.error('Error fetching hole scores for summary:', fetchError);
      return;
    }
      
    if (!holeScores || holeScores.length === 0) {
      console.log('No hole scores found for this round');
      return;
    }

    // Calculate totals from all holes, skipping null values
    const totals = holeScores.reduce((acc, hole) => ({
      score: acc.score + (hole.score || 0),
      putts: acc.putts + (hole.putts || 0),
      fairways: acc.fairways + (hole.fairway_hit ? 1 : 0),
      greens: acc.greens + (hole.green_in_regulation ? 1 : 0),
    }), { score: 0, putts: 0, fairways: 0, greens: 0 });
    
    console.log('Calculated round totals:', totals);
    
    const { error: updateError } = await supabase
      .from('rounds')
      .update({
        fairways_hit: totals.fairways,
        greens_in_regulation: totals.greens,
        updated_at: new Date().toISOString()
      })
      .eq('id', roundId);
      
    if (updateError) {
      console.error('Error updating round summary:', updateError);
    } else {
      console.log('Successfully updated round summary');
    }
      
  } catch (error) {
    console.error('Error in updateRoundSummary:', error);
  }
}
