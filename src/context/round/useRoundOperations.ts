
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
    
    if (!courseId) {
      console.error("Cannot create round: No course ID provided");
      return null;
    }
    
    try {
      console.log(`Creating round for course ${courseId} with tee ${teeId || 'none'}`);
      
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
      
      if (error) {
        console.error("Database error creating round:", error);
        throw error;
      }
      
      if (data && data.id) {
        console.log(`Successfully created round with ID: ${data.id}`);
        
        // Save the new round ID to storage for persistence
        try {
          sessionStorage.setItem('current-round-id', data.id);
          localStorage.setItem('current-round-id', data.id);
        } catch (storageError) {
          console.error('Failed to save round ID to storage:', storageError);
        }
        
        return data.id;
      } else {
        console.error("No round ID returned from database");
        return null;
      }
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
      // Calculate totals from existing scores
      const { data: holeScoresData, error: fetchError } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', currentRoundId);
        
      if (fetchError) throw fetchError;
      
      const completedScores = holeScoresData || [];
      
      // Calculate totals - only count values that actually exist
      const totals = completedScores.reduce((acc, hole) => ({
        score: acc.score + (hole.score || 0),
        putts: acc.putts + (hole.putts || 0),
        fairways: acc.fairways + (hole.fairway_hit ? 1 : 0),
        greens: acc.greens + (hole.green_in_regulation ? 1 : 0),
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
        description: `Your round has been saved successfully with a score of ${totals.score}`,
      });
      
      // Clear session storage so it doesn't auto-resume this round
      try {
        sessionStorage.removeItem('resume-hole-number');
        sessionStorage.removeItem('current-hole-number');
        // Keep current-round-id for history purposes
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
      
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
