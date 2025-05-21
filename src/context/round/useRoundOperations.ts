
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HoleData } from "@/types/round-tracking";
import { useAuth } from "@/context/AuthContext";

export const useRoundOperations = (
  holeScores: HoleData[], 
  setHoleScores: React.Dispatch<React.SetStateAction<HoleData[]>>,
  holeCount: number
) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  
  // Create a new round
  const createRound = async (courseId: string, teeId: string | null) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a round",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          user_id: user.id,
          course_id: courseId,
          tee_id: teeId,
          hole_count: holeCount,
          date: new Date().toISOString().split('T')[0]
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      if (data) {
        return data.id;
      }
      
      return null;
    } catch (error) {
      console.error("Error creating round:", error);
      toast({
        title: "Error Creating Round",
        description: "Could not create a new round. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  // Update a hole score
  const updateHoleScore = async (holeData: HoleData, currentRoundId: string | null) => {
    if (!currentRoundId || currentRoundId === 'new') {
      return true; // No need to save for new rounds
    }
    
    setSaveInProgress(true);
    
    try {
      // Remove the 'par' field from the data being sent to Supabase
      // as the 'hole_scores' table doesn't have a 'par' column
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
      
      if (error) throw error;
      
      // Update the hole scores in state with proper React.SetStateAction type
      setHoleScores(prev => {
        const newScores = [...prev];
        const index = newScores.findIndex(h => h.holeNumber === holeData.holeNumber);
        
        if (index >= 0) {
          newScores[index] = holeData;
        } else {
          newScores.push(holeData);
        }
        
        return newScores;
      });
      
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
  
  // Finish the round and calculate totals
  const finishRound = async (currentRoundId: string | null) => {
    if (!currentRoundId || currentRoundId === 'new') {
      toast({
        title: "Cannot Finish Round",
        description: "Round must be saved first",
        variant: "destructive"
      });
      return false;
    }
    
    setSaveInProgress(true);
    
    try {
      // Calculate totals
      const totals = holeScores.reduce((acc, hole) => ({
        score: acc.score + (hole.score || 0),
        putts: acc.putts + (hole.putts || 0),
        fairways: acc.fairways + (hole.fairwayHit ? 1 : 0),
        greens: acc.greens + (hole.greenInRegulation ? 1 : 0),
      }), { score: 0, putts: 0, fairways: 0, greens: 0 });
      
      // Update round totals
      const { error } = await supabase
        .from('rounds')
        .update({
          total_score: totals.score,
          total_putts: totals.putts,
          fairways_hit: totals.fairways,
          greens_in_regulation: totals.greens,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentRoundId);
        
      if (error) throw error;
      
      toast({
        title: "Round Completed",
        description: "Your round has been saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error finishing round:", error);
      toast({
        title: "Error Saving Round",
        description: "Could not save round data. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaveInProgress(false);
    }
  };

  return {
    saveInProgress,
    createRound,
    updateHoleScore,
    finishRound
  };
};
