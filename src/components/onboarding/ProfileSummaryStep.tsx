// src/components/ProfileSummaryStep.tsx
import React from "react";
import { View, Text } from "react-native";
import { Separator } from "@/components/ui/Separator"; // assume RN-compatible
import { commonGolfGoals } from "./CommonGoals";

interface ProfileSummaryStepProps {
  handicap: string;
  goals: string;
  selectedGoals: string[];
  scoreGoal: number | null;
  handicapGoal: number | null;
}

const ProfileSummaryStep = ({
  handicap,
  goals,
  selectedGoals,
  scoreGoal,
  handicapGoal,
}: ProfileSummaryStepProps) => {
  return (
    <View className="space-y-6 animate-fade-in">
      <Text className="text-lg font-medium">Your SwingAI Profile</Text>

      <View className="space-y-2">
        <Text className="font-medium">Skill Level:</Text>
        <Text className="text-muted-foreground capitalize">{handicap}</Text>
      </View>

      <Separator />

      <View className="space-y-2">
        <Text className="font-medium">Selected Goals:</Text>
        <View className="space-y-2">
          {selectedGoals.map((goalId) => {
            const goal = commonGolfGoals.find((g) => g.id === goalId);
            if (!goal) return null;
            const Icon = goal.icon;
            return (
              <View
                key={goalId}
                className="flex-row items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <Text>{goal.label}</Text>
                {goalId === "lower-score" && scoreGoal !== null && (
                  <Text className="text-sm">
                    {" "}
                    (Target: {scoreGoal})
                  </Text>
                )}
                {goalId === "handicap" && handicapGoal !== null && (
                  <Text className="text-sm">
                    {" "}
                    (Target: {handicapGoal})
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {goals ? (
        <>
          <Separator />
          <View className="space-y-2">
            <Text className="font-medium">Additional Goals:</Text>
            <Text className="text-muted-foreground">{goals}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
};

export default ProfileSummaryStep;
