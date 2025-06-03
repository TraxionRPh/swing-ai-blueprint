// src/components/DrillCardDetails.tsx
import React from "react";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/Button"; // RN-compatible Button
import { Info } from "lucide-react-native";

interface DrillCardDetailsProps {
  sets: number;
  reps: number;
  duration: string;
  onViewDetails: () => void;
}

export const DrillCardDetails = ({
  sets,
  reps,
  duration,
  onViewDetails,
}: DrillCardDetailsProps) => {
  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center">
        <Text className="text-sm text-muted-foreground">
          {sets} sets of {reps} reps
        </Text>
        <Text className="text-sm text-muted-foreground mx-2">•</Text>
        <Text className="text-sm text-muted-foreground">
          {duration || "10-15 minutes"}
        </Text>
      </View>

      <Button
        variant="ghost"
        size="sm"
        className="p-0 h-8 w-8"
        onPress={onViewDetails}
      >
        <Info className="h-4 w-4 text-muted-foreground" />
      </Button>
    </View>
  );
};
