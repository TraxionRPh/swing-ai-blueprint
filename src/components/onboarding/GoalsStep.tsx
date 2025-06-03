// src/components/GoalsStep.tsx
import React from "react";
import { View, Text, TextInput } from "react-native";
import CommonGoals from "./CommonGoals";

interface GoalsStepProps {
  goals: string;
  setGoals: (value: string) => void;
  selectedGoals: string[];
  setSelectedGoals: (goals: string[]) => void;
  scoreGoal: number | null;
  setScoreGoal: (score: number | null) => void;
  handicapGoal: number | null;
  setHandicapGoal: (handicap: number | null) => void;
}

const GoalsStep = ({
  goals,
  setGoals,
  selectedGoals,
  setSelectedGoals,
  scoreGoal,
  setScoreGoal,
  handicapGoal,
  setHandicapGoal,
}: GoalsStepProps) => {
  const handleGoalToggle = (goalId: string, checked: boolean) => {
    if (checked) {
      setSelectedGoals([...selectedGoals, goalId]);
    } else {
      setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
      if (goalId === "lower-score") {
        setScoreGoal(null);
      }
      if (goalId === "handicap") {
        setHandicapGoal(null);
      }
    }
  };

  return (
    <View className="space-y-6 animate-fade-in">
      <Text className="text-lg font-medium">What are your golf goals?</Text>

      <CommonGoals
        selectedGoals={selectedGoals}
        scoreGoal={scoreGoal}
        handicapGoal={handicapGoal}
        onGoalToggle={handleGoalToggle}
        onScoreGoalChange={setScoreGoal}
        onHandicapGoalChange={setHandicapGoal}
      />

      <View className="space-y-2">
        <Text className="text-sm text-muted-foreground">
          Additional goals or notes (optional):
        </Text>
        <TextInput
          multiline
          placeholder="Any other specific goals or details you'd like to share..."
          className="min-h-24 bg-card rounded p-2 text-foreground"
          value={goals}
          onChangeText={setGoals}
        />
      </View>
    </View>
  );
};

export default GoalsStep;
