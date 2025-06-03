// src/components/ChallengeScore.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@/components/ui/Button"; // RN-compatible button
import { useToast } from "@/hooks/use-toast";

interface ChallengeScoreProps {
  planId?: string;
  type: "initial" | "final";
}

export const ChallengeScore = ({ planId, type }: ChallengeScoreProps) => {
  const { toast } = useToast();
  const [score, setScore] = useState<string>("");

  // Load saved score from AsyncStorage when mounted
  useEffect(() => {
    const loadScore = async () => {
      if (!planId) return;

      try {
        const key = `challenge-${type}-${planId}`;
        const saved = await AsyncStorage.getItem(key);
        if (saved !== null) {
          setScore(saved);
        }
      } catch (e) {
        console.error("Error loading score:", e);
      }
    };
    loadScore();
  }, [planId, type]);

  const handleSave = async () => {
    if (!planId) {
      toast({
        title: "Error",
        description: "Cannot save score without a plan ID",
        variant: "destructive",
      });
      return;
    }

    const numeric = parseInt(score, 10);
    if (isNaN(numeric) || numeric < 0 || numeric > 10) {
      toast({
        title: "Invalid Score",
        description: "Please enter a number between 0 and 10.",
        variant: "destructive",
      });
      return;
    }

    try {
      const key = `challenge-${type}-${planId}`;
      await AsyncStorage.setItem(key, score);
      toast({
        title: "Score Saved",
        description: `Your ${type} score of ${score}/10 has been saved.`,
      });
    } catch (e) {
      console.error("Error saving score:", e);
      toast({
        title: "Error Saving",
        description: "There was a problem saving your score.",
        variant: "destructive",
      });
    }
  };

  return (
    <View className="space-y-4">
      <Text className="text-sm text-muted-foreground">
        Enter your score out of 10 attempts:
      </Text>

      <View className="flex-row gap-2 items-center">
        <TextInput
          value={score}
          onChangeText={setScore}
          placeholder="Enter Score"
          className="max-w-[200px] bg-card text-foreground px-2 py-1 rounded border border-primary/20"
          keyboardType="numeric"
          maxLength={2}
        />
        <Button onPress={handleSave}>
          <Text className="text-white">Save Score</Text>
        </Button>
      </View>
    </View>
  );
};
