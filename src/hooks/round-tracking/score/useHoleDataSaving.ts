
import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

/**
 * Hook for saving hole data to database
 */
export const useHoleDataSaving = (roundId: string | null, currentHoleData: HoleData | undefined) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);

  const saveHoleScore = useCallback(async (holeData: HoleData) => {
    if (!roundId || roundId === "new") {
      console.log("No valid roundId for saving, storing in session storage only");
      try {
        sessionStorage.setItem('resume-hole-number', holeData.holeNumber.toString());
      } catch (e) {
        // Ignore storage errors
      }
      return true;
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
        score: holeData.score || 0,  // Use 0 instead of null for empty values
        putts: typeof holeData.putts === 'number' ? holeData.putts : 0,  // Use 0 if not set
        fairway_hit: !!holeData.fairwayHit,
        green_in_regulation: !!holeData.greenInRegulation
      };
      
      console.log('Saving hole data to database:', dataToSave);
      
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
      
      // Show toast to confirm save
      toast({
        title: "Score Saved",
        description: `Hole ${holeData.holeNumber} data saved successfully`,
        variant: "default"
      });
      
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
      // Clear any existing timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      
      // Add a slightly longer delay before removing the saving indicator
      timeoutIdRef.current = setTimeout(() => {
        setIsSaving(false);
      }, 500);
      
      // Save to session storage as backup/resume point
      try {
        if (holeData.holeNumber) {
          sessionStorage.setItem('resume-hole-number', holeData.holeNumber.toString());
        }
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [roundId, toast]);

  // Function to navigate to next hole with saving
  const saveAndNavigateNext = useCallback((handleNext: () => void) => {
    if (roundId && roundId !== "new" && currentHoleData) {
      console.log("Saving hole data before navigating to next hole", currentHoleData);
      saveHoleScore(currentHoleData).catch((err) => {
        console.error("Failed to save hole data:", err);
      });
    }
    handleNext();
  }, [currentHoleData, roundId, saveHoleScore]);
  
  // Function to navigate to previous hole with saving
  const saveAndNavigatePrevious = useCallback((handlePrevious: () => void) => {
    if (roundId && roundId !== "new" && currentHoleData) {
      console.log("Saving hole data before navigating to previous hole", currentHoleData);
      saveHoleScore(currentHoleData).catch((err) => {
        console.error("Failed to save hole data:", err);
      });
    }
    handlePrevious();
  }, [currentHoleData, roundId, saveHoleScore]);

  return {
    saveHoleScore,
    isSaving,
    saveAndNavigateNext,
    saveAndNavigatePrevious
  };
};

// Helper function to update the round summary with correct hole count
async function updateRoundSummary(roundId: string) {
  try {
    console.log('Updating round summary for round:', roundId);
    
    // Get the current hole count from session storage
    let holeCount = 18; // Default to 18 holes
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    
    if (storedHoleCount) {
      holeCount = parseInt(storedHoleCount, 10);
      console.log(`Using stored hole count: ${holeCount}`);
    }
    
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

    // Limit scores to the correct hole count (9 or 18)
    const validScores = holeScores.filter(score => score.hole_number <= holeCount);
    console.log(`Using ${validScores.length} scores out of ${holeScores.length} for a ${holeCount}-hole round`);

    // Calculate totals from all valid holes
    const totals = validScores.reduce((acc, hole) => ({
      score: acc.score + (hole.score || 0),
      putts: acc.putts + (hole.putts || 0),
      fairways: acc.fairways + (hole.fairway_hit ? 1 : 0),
      greens: acc.greens + (hole.green_in_regulation ? 1 : 0)
    }), { score: 0, putts: 0, fairways: 0, greens: 0 });
    
    console.log('Calculated round totals:', totals);
    
    // Update with the calculated values and ensure hole_count is set correctly
    const updateData = {
      total_score: totals.score,
      total_putts: totals.putts,
      fairways_hit: totals.fairways,
      greens_in_regulation: totals.greens,
      hole_count: holeCount,
      updated_at: new Date().toISOString()
    };
    
    console.log('Updating round with:', updateData);
    
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
