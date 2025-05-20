
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";
import { useScoreData } from "./useScoreData";
import { useHoleNavigation } from "./useHoleNavigation"; 
import { useHoleDataSaving } from "./useHoleDataSaving";
import { useRoundFinalization } from "../useRoundFinalization";

/**
 * Main hook for score tracking functionality
 * Combines smaller, focused hooks for better maintainability
 */
export const useScoreTracking = (
  roundId: string | null, 
  courseId: string | undefined, 
  holeScores: HoleData[], 
  setHoleScores: (scores: HoleData[]) => void
) => {
  // Use navigation hook for hole navigation
  const {
    currentHole,
    setCurrentHole,
    handleNext: baseHandleNext,
    handlePrevious: baseHandlePrevious,
    clearResumeData
  } = useHoleNavigation();
  
  // Get current hole data and update handler
  const { currentHoleData, handleHoleUpdate } = useScoreData(holeScores, setHoleScores, currentHole);
  
  // Get saving functionality
  const {
    saveHoleScore,
    isSaving,
    saveAndNavigateNext,
    saveAndNavigatePrevious
  } = useHoleDataSaving(roundId, currentHoleData);
  
  const { toast } = useToast();
  
  // Base finish round implementation
  const baseFinishRound = useCallback(async (holeScores: HoleData[], holeCount: number) => {
    console.log("Base finish round called with:", { holeScores, holeCount, roundId });
    
    if (!roundId || roundId === "new") {
      console.warn("Cannot finish round: Invalid round ID");
      return false;
    }
    
    try {
      // Calculate totals from valid holes
      const validHoleScores = holeScores.slice(0, holeCount);
      
      const totalScore = validHoleScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
      const totalPutts = validHoleScores.reduce((sum, hole) => sum + (hole.putts || 0), 0);
      const fairwaysHit = validHoleScores.filter(hole => hole.fairwayHit).length;
      const greensInRegulation = validHoleScores.filter(hole => hole.greenInRegulation).length;
      
      console.log("Submitting round data to Supabase:", {
        totalScore,
        totalPutts,
        fairwaysHit,
        greensInRegulation
      });
      
      // Update the round with final scores
      const { error } = await supabase
        .from('rounds')
        .update({ 
          total_score: totalScore,
          total_putts: totalPutts,
          fairways_hit: fairwaysHit,
          greens_in_regulation: greensInRegulation,
          hole_count: holeCount
        })
        .eq('id', roundId);
        
      if (error) {
        console.error('Error updating round:', error);
        toast({
          title: "Error saving round",
          description: "Could not save your round data. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Round successfully updated with final scores");
      return true;
    } catch (error) {
      console.error("Error in baseFinishRound:", error);
      return false;
    }
  }, [roundId, toast]);
  
  // Get finalization functionality
  const { finishRound } = useRoundFinalization(baseFinishRound, holeScores);
  
  // Save current hole data and navigate to next hole
  const handleNext = useCallback(() => {
    saveAndNavigateNext(baseHandleNext);
  }, [saveAndNavigateNext, baseHandleNext]);
  
  // Save current hole data and navigate to previous hole
  const handlePrevious = useCallback(() => {
    saveAndNavigatePrevious(baseHandlePrevious);
  }, [saveAndNavigatePrevious, baseHandlePrevious]);

  return {
    currentHole,
    setCurrentHole,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData,
    clearResumeData,
    finishRound
  };
};
