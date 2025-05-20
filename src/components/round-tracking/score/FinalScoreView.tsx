
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
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { achievedGoal, checkScoreGoal, resetAchievedGoal, navigateToSetNewGoal } = useGoalAchievement();
  const { toast } = useToast();
  
  // Calculate total score to check against goal but don't show achievement immediately
  useEffect(() => {
    // Only use the relevant scores based on hole count
    const validHoleScores = holeScores.slice(0, holeCount);
    const totalScore = validHoleScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
    
    // Initialize the check, but don't display yet
    if (totalScore > 0) {
      // Only run the check but don't display until after round submission
      checkScoreGoal(totalScore, false);
    }
  }, [holeScores, holeCount, checkScoreGoal]);
  
  const handleConfirmRound = async () => {
    console.log(`Finalizing round with hole count: ${holeCount}, scores: ${holeScores.length}`);
    
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate request");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Pass the explicit hole count to ensure proper saving
      const success = await finishRound(holeCount);
      
      if (success) {
        toast({
          title: "Round submitted",
          description: `Your ${holeCount}-hole round has been saved successfully!`,
          variant: "default"
        });
        
        // Only show achievement modal for 18-hole rounds after successful round submission
        if (holeCount === 18) {
          // Re-check the score goal with display enabled
          const validHoleScores = holeScores.slice(0, holeCount);
          const totalScore = validHoleScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
          const hasAchievement = checkScoreGoal(totalScore, true);
          
          // Only show goal modal if there's an achievement
          if (hasAchievement) {
            setShowGoalModal(true);
          } else {
            onBack();
          }
        } else {
          // If it's a 9-hole round, just go back
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
      setIsSubmitting(false);
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
        isSubmitting={isSubmitting}
      />

      {showGoalModal && achievedGoal && (
        <GoalAchievementModal
          achievedGoal={achievedGoal}
          onClose={handleCloseGoalModal}
          onSetNewGoal={handleSetNewGoal}
        />
      )}
    </>
  );
};
