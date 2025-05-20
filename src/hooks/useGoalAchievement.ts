
import { useState, useCallback } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';

export type AchievedGoal = {
  type: 'score' | 'handicap';
  value: number;
} | null;

export const useGoalAchievement = () => {
  const { scoreGoal, handicapGoal } = useProfile();
  const navigate = useNavigate();
  const [achievedGoal, setAchievedGoal] = useState<AchievedGoal>(null);

  const checkScoreGoal = useCallback((score: number, showAchievement: boolean = true) => {
    if (scoreGoal && score <= scoreGoal) {
      console.log(`Score goal achieved! ${score} <= ${scoreGoal}`);
      
      // Only set the achieved goal state if showAchievement is true
      if (showAchievement) {
        setAchievedGoal({ type: 'score', value: scoreGoal });
      }
      return true;
    }
    return false;
  }, [scoreGoal]);

  const checkHandicapGoal = useCallback((handicap: number, showAchievement: boolean = true) => {
    if (handicapGoal && handicap <= handicapGoal) {
      console.log(`Handicap goal achieved! ${handicap} <= ${handicapGoal}`);
      
      // Only set the achieved goal state if showAchievement is true
      if (showAchievement) {
        setAchievedGoal({ type: 'handicap', value: handicapGoal });
      }
      return true;
    }
    return false;
  }, [handicapGoal]);

  const resetAchievedGoal = useCallback(() => {
    setAchievedGoal(null);
  }, []);

  const navigateToSetNewGoal = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  return {
    achievedGoal,
    checkScoreGoal,
    checkHandicapGoal,
    resetAchievedGoal,
    navigateToSetNewGoal
  };
};
