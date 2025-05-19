
import { useState, useEffect } from "react";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
import GoalAchievementModal from "@/components/goals/GoalAchievementModal";
import { useGoalAchievement } from "@/hooks/useGoalAchievement";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

interface FinalScoreViewProps {
  holeScores: HoleData[];
  holeCount: number;
  finishRound: (holeCount: number) => Promise<boolean>;
  onBack: () => void;
}

export const FinalScoreView = ({
  holeScores,
  holeCount,
  finishRound,
  onBack
}: FinalScoreViewProps) => {
  const [showFinalScore, setShowFinalScore] = useState(true);
  const { achievedGoal, checkScoreGoal, resetAchievedGoal, navigateToSetNewGoal } = useGoalAchievement();
  const { toast } = useToast();
  
  // Calculate total score to check against goal
  useEffect(() => {
    const validHoleScores = holeScores.slice(0, holeCount);
    const totalScore = validHoleScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
    
    if (totalScore > 0) {
      // Check if score goal is achieved
      checkScoreGoal(totalScore);
    }
  }, [holeScores, holeCount, checkScoreGoal]);
  
  const handleConfirmRound = async () => {
    console.log("Finalizing round with hole count:", holeCount);
    try {
      const success = await finishRound(holeCount);
      
      if (success) {
        toast({
          title: "Round submitted",
          description: "Your round has been saved successfully!",
          variant: "default"
        });
        
        if (!achievedGoal) {
          onBack();
        }
      } else {
        toast({
          title: "Submission failed",
          description: "There was an error saving your round. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting round:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowFinalScore(false);
    }
  };

  const handleCloseGoalModal = () => {
    resetAchievedGoal();
    onBack();
  };

  const handleSetNewGoal = () => {
    resetAchievedGoal();
    navigateToSetNewGoal();
  };
  
  return (
    <>
      <FinalScoreCard
        holeScores={holeScores.slice(0, holeCount)}
        isOpen={showFinalScore}
        onConfirm={handleConfirmRound}
        onCancel={() => {
          setShowFinalScore(false);
          onBack();
        }}
        holeCount={holeCount}
      />

      <GoalAchievementModal
        achievedGoal={achievedGoal}
        onClose={handleCloseGoalModal}
        onSetNewGoal={handleSetNewGoal}
      />
    </>
  );
};
