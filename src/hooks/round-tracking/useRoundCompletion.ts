
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGoalAchievement } from "@/hooks/useGoalAchievement";

export const useRoundCompletion = (roundId: string | undefined, totalScore: number, totalHoles: number) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  
  // Import goal achievement hooks
  const { 
    checkScoreGoal
  } = useGoalAchievement();

  const completeRound = async (roundStats: {
    totalScore: number;
    totalPutts: number;
    fairwaysHit: number;
    greensInRegulation: number;
  }) => {
    if (!roundId) return;
    
    try {
      setIsSaving(true);
      
      // Update round with totals
      const { error } = await supabase
        .from("rounds")
        .update({
          total_score: roundStats.totalScore,
          total_putts: roundStats.totalPutts,
          fairways_hit: roundStats.fairwaysHit,
          greens_in_regulation: roundStats.greensInRegulation,
          updated_at: new Date().toISOString()
        })
        .eq("id", roundId);
      
      if (error) throw error;
      
      // Clean up session storage
      try {
        sessionStorage.removeItem("current-round-id");
        sessionStorage.removeItem("selected-hole-count");
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
      
      // Check if this is a personal best or meets the user's score goal
      // Pass true to make the modal show after completion
      if (totalHoles === 18) {
        const goalAchieved = checkScoreGoal(totalScore, true);
        
        if (goalAchieved) {
          setShowConfetti(true);
        }
      }
      
      toast({
        title: "Round Completed",
        description: `Your ${totalHoles}-hole round has been saved`,
      });
      
      // Navigate to rounds dashboard
      navigate("/rounds");
    } catch (error) {
      console.error("Error completing round:", error);
      toast({
        title: "Error saving round",
        description: "Could not save round information",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return { completeRound, isSaving, showConfetti };
};
