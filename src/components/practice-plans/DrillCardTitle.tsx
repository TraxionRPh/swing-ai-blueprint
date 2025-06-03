// src/components/DrillCardTitle.tsx
import React from "react";
import { View, Text } from "react-native";
import { Checkbox } from "@/components/ui/Checkbox"; // RN-compatible Checkbox
import { Badge } from "@/components/ui/Badge"; // RN-compatible Badge
import { Drill } from "@/types/drill";

interface DrillCardTitleProps {
  drill: Drill;
  isCompleted: boolean;
  onComplete: () => void;
}

export const DrillCardTitle = ({
  drill,
  isCompleted,
  onComplete,
}: DrillCardTitleProps) => {
  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center space-x-3">
        <Checkbox
          value={isCompleted}
          onValueChange={onComplete}
        />
        <Text
          className={`font-medium text-base ${
            isCompleted ? "text-muted-foreground line-through" : ""
          }`}
        >
          {drill.title}
        </Text>
      </View>

      <Badge variant="outline" className="text-xs">
        {drill.difficulty || "Beginner"}
      </Badge>
    </View>
  );
};
