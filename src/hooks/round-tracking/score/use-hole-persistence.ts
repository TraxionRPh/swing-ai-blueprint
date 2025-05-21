
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
      // Remove the par field as it's not in the hole_scores table
      const dataToSave = {
        round_id: roundId,
        hole_number: holeData.holeNumber,
        score: holeData.score || 0,  // Use 0 instead of null for empty values
        putts: typeof holeData.putts === 'number' ? holeData.putts : 0,  // Use 0 instead of null for consistency
        fairway_hit: !!holeData.fairwayHit,
        green_in_regulation: !!holeData.greenInRegulation
      };
      
      console.log('Saving hole data to database:', dataToSave);
      
      // Track time for the save operation
      const startTime = Date.now();
      
      const { error } = await supabase
        .from('hole_scores')
        .upsert(dataToSave, {
          onConflict: 'round_id,hole_number'
        });

      if (error) {
        console.error('Error in supabase upsert:', error);
        throw error;
      }
      
      const saveTime = Date.now() - startTime;
      console.log(`Database save completed in ${saveTime}ms`);
      
      // Only update round summary after successful save of hole data
      await updateRoundSummary(roundId);
      console.log(`Successfully saved hole ${holeData.holeNumber} data`);
      
      // Show toast to confirm save
      toast({
        title: "Score Saved",
        description: `Hole ${holeData.holeNumber} data saved successfully`,
        variant: "default"
      });
      
      // Verify data was saved by checking the database again
      const { data: verifyData } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', roundId)
        .eq('hole_number', holeData.holeNumber)
        .single();
      
      if (verifyData) {
        console.log(`Verified data was saved for hole ${holeData.holeNumber}:`, verifyData);
      } else {
        console.warn(`Could not verify data was saved for hole ${holeData.holeNumber}`);
      }
      
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
      // Add a slightly longer delay before removing the saving indicator
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
      scoreCount: acc.scoreCount + (hole.score ? 1 : 0),
      puttsCount: acc.puttsCount + (hole.putts ? 1 : 0)
    }), { score: 0, putts: 0, fairways: 0, greens: 0, scoreCount: 0, puttsCount: 0 });
    
    console.log('Calculated round totals:', totals);
    
    // Only update total_score and total_putts if we have complete data
    // Otherwise keep them null until the round is finished
    const updateData: any = {
      fairways_hit: totals.fairways,
      greens_in_regulation: totals.greens,
      updated_at: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('rounds')
      .update(updateData)
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
