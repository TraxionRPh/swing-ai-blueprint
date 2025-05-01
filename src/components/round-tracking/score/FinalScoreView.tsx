
import { useState, useEffect } from "react";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
import GoalAchievementModal from "@/components/goals/GoalAchievementModal";
import { useGoalAchievement } from "@/hooks/useGoalAchievement";
import type { HoleData } from "@/types/round-tracking";

interface FinalScoreViewProps {
  holeScores: HoleData[];
  holeCount: number;
  finishRound: () => Promise<boolean>;
  onBack: () => void;
}

export const FinalScoreView = ({
  holeScores,
  holeCount,
  finishRound,
  onBack
}: FinalScoreViewProps) => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const { achievedGoal, checkScoreGoal, resetAchievedGoal, navigateToSetNewGoal } = useGoalAchievement();
  
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
    const success = await finishRound();
    setShowFinalScore(false);
    
    if (success && !achievedGoal) {
      onBack();
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
        onCancel={() => setShowFinalScore(false)}
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
