// src/components/CommonGoals.tsx
import React from "react";
import { View, Text, TextInput } from "react-native";
import { Checkbox } from "@/components/ui/Checkbox"; // assume RN‐compatible
import {
  Target,
  Goal,
  Check,
  ListCheck,
} from "lucide-react-native"; // RN‐compatible icons

export const commonGolfGoals = [
  {
    id: "lower-score",
    label: "Lower my score",
    icon: Target,
    requiresNumber: true,
  },
  {
    id: "consistency",
    label: "Improve consistency",
    icon: ListCheck,
    requiresNumber: false,
  },
  {
    id: "technique",
    label: "Better technique",
    icon: Check,
    requiresNumber: false,
  },
  {
    id: "handicap",
    label: "Lower my handicap",
    icon: Goal,
    requiresNumber: true,
  },
] as const;

interface CommonGoalsProps {
  selectedGoals: string[];
  scoreGoal: number | null;
  handicapGoal: number | null;
  onGoalToggle: (goalId: string, checked: boolean) => void;
  onScoreGoalChange: (value: number | null) => void;
  onHandicapGoalChange: (value: number | null) => void;
}

const CommonGoals = ({
  selectedGoals,
  scoreGoal,
  handicapGoal,
  onGoalToggle,
  onScoreGoalChange,
  onHandicapGoalChange,
}: CommonGoalsProps) => {
  return (
    <View className="space-y-4">
      {commonGolfGoals.map((goal) => {
        const checked = selectedGoals.includes(goal.id);
        const Icon = goal.icon;
        return (
          <View
            key={goal.id}
            className="flex-row items-start space-x-3 p-2 rounded-lg"
          >
            <Checkbox
              value={checked}
              onValueChange={(value) => onGoalToggle(goal.id, value)}
            />
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Icon className="h-4 w-4" />
                <Text className="text-sm font-medium">{goal.label}</Text>
              </View>

              {goal.id === "lower-score" && checked && (
                <View className="mt-2 ml-6">
                  <Text className="text-sm text-muted-foreground">
                    What's your target score?
                  </Text>
                  <TextInput
                    value={scoreGoal !== null ? String(scoreGoal) : ""}
                    onChangeText={(text) =>
                      onScoreGoalChange(text ? parseInt(text, 10) : null)
                    }
                    className="w-24 mt-1 bg-[#111827] text-foreground border border-primary/20 px-2 py-1 rounded"
                    keyboardType="numeric"
                    placeholder="Score"
                    placeholderTextColor="#999"
                  />
                </View>
              )}

              {goal.id === "handicap" && checked && (
                <View className="mt-2 ml-6">
                  <Text className="text-sm text-muted-foreground">
                    What's your target handicap?
                  </Text>
                  <TextInput
                    value={handicapGoal !== null ? String(handicapGoal) : ""}
                    onChangeText={(text) =>
                      onHandicapGoalChange(text ? parseInt(text, 10) : null)
                    }
                    className="w-24 mt-1 bg-[#111827] text-foreground border border-primary/20 px-2 py-1 rounded"
                    keyboardType="numeric"
                    placeholder="Handicap"
                    placeholderTextColor="#999"
                  />
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default CommonGoals;
