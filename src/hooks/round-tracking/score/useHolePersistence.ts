
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { HoleData } from '@/types/round-tracking';

/**
 * Hook for persisting hole score changes to the database
 */
export const useHolePersistence = (roundId: string | null) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Reset saving status after a delay
  const resetSavingStatus = () => {
    setTimeout(() => {
      setSaveSuccess(false);
      setSaveError(null);
    }, 2000);
  };
  
  // Save hole score to the database
  const saveHoleScore = useCallback(async (holeData: HoleData): Promise<boolean> => {
    if (!roundId || roundId === 'new' || !holeData) {
      console.log('Cannot save hole data: Invalid round ID or hole data');
      return false;
    }
    
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setSaveError(null);
      
      console.log(`Saving hole ${holeData.holeNumber} data for round ${roundId}`);
      console.log('Hole data to save:', holeData);
      
      const { error } = await supabase
        .from('hole_scores')
        .upsert({
          round_id: roundId,
          hole_number: holeData.holeNumber,
          score: holeData.score || 0,
          putts: holeData.putts || 0,
          fairway_hit: holeData.fairwayHit,
          green_in_regulation: holeData.greenInRegulation,
          par: holeData.par || 4 // Save the par value
        }, {
          onConflict: 'round_id,hole_number'
        });
      
      if (error) {
        console.error('Error saving hole score:', error);
        setSaveError(error.message);
        resetSavingStatus();
        return false;
      }
      
      console.log('Hole score saved successfully');
      setSaveSuccess(true);
      resetSavingStatus();
      return true;
    } catch (error: any) {
      console.error('Exception saving hole score:', error);
      setSaveError(error.message);
      resetSavingStatus();
      return false;
    } finally {
      setIsSaving(false);
      
      // Save to session storage as backup/resume point
      try {
        sessionStorage.setItem('resume-hole-number', holeData.holeNumber.toString());
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [roundId]);
  
  return {
    saveHoleScore,
    isSaving,
    saveSuccess,
    saveError
  };
};
