// src/components/EmptyPlansState.tsx
import React from "react";
import { View, Text } from "react-native";
import { useNavigate } from "react-router-native";
import { Button } from "@/components/ui/Button"; // RN-compatible Button
import { Card } from "@/components/ui/Card"; // RN-compatible Card


export const EmptyPlansState = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-8 text-center">
      <View className="space-y-4">
        <Text className="text-xl font-semibold">
          No Practice Plans Yet
        </Text>
        <Text className="text-muted-foreground">
          Your saved practice plans will appear here. Create a plan from the Practice Plan Generator.
        </Text>
        <Button
          onPress={() => navigate("/practice-plans")}
          className="mt-4"
        >
          <Text className="text-white">Create a Practice Plan</Text>
        </Button>
      </View>
    </Card>
  );
};
