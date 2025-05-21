
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGoalAchievement } from "@/hooks/useGoalAchievement";

export const useRoundCompletion = (roundId: string | undefined, totalScore: number, totalHoles: number) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Import goal achievement hooks
  const { 
    checkScoreGoal,
    achievedGoal,
    resetAchievedGoal
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
      
      // Check if this round meets the user's score goal (only for 18-hole rounds)
      let goalAchieved = false;
      if (totalHoles === 18) {
        goalAchieved = checkScoreGoal(totalScore, false);
        
        if (goalAchieved) {
          console.log("Goal achieved! Redirecting to achievement page");
          // Instead of showing modal, navigate directly to achievement page
          navigate("/goal-achievement", {
            state: {
              goalType: "score",
              goalValue: achievedGoal?.value,
              actualValue: totalScore
            }
          });
          return; // Exit early after redirect
        }
      }
      
      // Only show regular toast if no goal was achieved
      if (!goalAchieved) {
        toast({
          title: "Round Completed",
          description: `Your ${totalHoles}-hole round has been saved`,
        });
        
        // Navigate to rounds dashboard for normal completion
        navigate("/rounds");
      }
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
  
  return { 
    completeRound, 
    isSaving, 
    achievedGoal,
    resetAchievedGoal
  };
};
