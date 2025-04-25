
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

export const useScoreTracking = (roundId: string | null) => {
  const [currentHole, setCurrentHole] = useState(1);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Initialize hole scores when roundId changes
  useEffect(() => {
    if (roundId) {
      // Fetch existing hole scores for this round
      const fetchHoleScores = async () => {
        try {
          const { data, error } = await supabase
            .from('hole_scores')
            .select('*')
            .eq('round_id', roundId)
            .order('hole_number');

          if (error) throw error;

          if (data && data.length > 0) {
            // Convert from DB format to our format
            const formattedScores = data.map(hole => ({
              holeNumber: hole.hole_number,
              par: 4, // Default, will be updated when course data is available
              distance: 0, // Default, will be updated when course data is available
              score: hole.score || 0,
              putts: hole.putts || 0,
              fairwayHit: hole.fairway_hit || false,
              greenInRegulation: hole.green_in_regulation || false
            }));
            
            // Create a full 18-hole array with default values for holes not in DB
            const fullScores = Array.from({ length: 18 }, (_, i) => {
              const existingHole = formattedScores.find(h => h.holeNumber === i + 1);
              return existingHole || {
                holeNumber: i + 1,
                par: 4,
                distance: 0,
                score: 0,
                putts: 0,
                fairwayHit: false,
                greenInRegulation: false
              };
            });
            
            setHoleScores(fullScores);
          } else {
            // Initialize with default values if no scores exist
            const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
              holeNumber: i + 1,
              par: 4,
              distance: 0,
              score: 0,
              putts: 0,
              fairwayHit: false,
              greenInRegulation: false
            }));
            setHoleScores(defaultHoles);
          }
        } catch (error) {
          console.error('Error fetching hole scores:', error);
        }
      };

      fetchHoleScores();
    } else if (holeScores.length === 0) {
      // Initialize with default values if no roundId exists yet
      const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        par: 4,
        distance: 0,
        score: 0,
        putts: 0,
        fairwayHit: false,
        greenInRegulation: false
      }));
      setHoleScores(defaultHoles);
    }
  }, [roundId]);

  // Enhanced saveHoleScore function with better error handling and state management
  const saveHoleScore = async (holeData: HoleData) => {
    if (!roundId) return;
    
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
      
      // Update the round's total score, putts, etc.
      await updateRoundSummary();
      
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

  // Update the round summary (total score, putts, etc.)
  const updateRoundSummary = async () => {
    if (!roundId) return;
    
    try {
      // Calculate totals
      const totals = holeScores.reduce((acc, hole) => ({
        score: acc.score + (hole.score || 0),
        putts: acc.putts + (hole.putts || 0),
        fairways: acc.fairways + (hole.fairwayHit ? 1 : 0),
        greens: acc.greens + (hole.greenInRegulation ? 1 : 0),
      }), { score: 0, putts: 0, fairways: 0, greens: 0 });
      
      // Update the rounds table
      const { error } = await supabase
        .from('rounds')
        .update({
          total_score: totals.score,
          total_putts: totals.putts,
          fairways_hit: totals.fairways,
          greens_in_regulation: totals.greens,
          updated_at: new Date().toISOString()
        })
        .eq('id', roundId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating round summary:', error);
    }
  };

  const handleHoleUpdate = (data: HoleData) => {
    // Update the local state
    setHoleScores(prev => 
      prev.map(hole => 
        hole.holeNumber === data.holeNumber ? data : hole
      )
    );
    
    // Autosave whenever data changes
    saveHoleScore(data);
  };

  const handleNext = () => {
    if (currentHole < 18) {
      setCurrentHole(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentHole > 1) {
      setCurrentHole(prev => prev - 1);
    }
  };

  return {
    currentHole,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData: holeScores.find(hole => hole.holeNumber === currentHole) || {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }
  };
};
