// src/components/CommonProblemCard.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Badge } from "@/components/ui/Badge"; // RN-compatible Badge

interface CommonProblem {
  problem: string;
  popularity: string;
  description: string;
}

interface CommonProblemCardProps {
  item: CommonProblem;
  onSelect: (problem: string) => void;
}

export const CommonProblemCard = ({
  item,
  onSelect,
}: CommonProblemCardProps) => {
  // Convert popularity values to display text
  const getPopularityText = (popularity: string) => {
    switch (popularity.toLowerCase()) {
      case "high":
        return "Very Common";
      case "medium":
        return "Common";
      case "low":
        return "Occasional";
      default:
        return popularity;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onSelect(item.problem)}
      className="w-full p-3 bg-muted/50 hover:bg-muted rounded-lg border border-transparent hover:border-muted-foreground/20 transition-colors"
    >
      <View className="flex-row justify-between items-start mb-1">
        <Text className="font-medium text-base line-clamp-1 flex-1">
          {item.problem}
        </Text>
        <Badge variant="outline" className="text-xs">
          {getPopularityText(item.popularity)}
        </Badge>
      </View>
      <Text className="text-xs text-muted-foreground line-clamp-2">
        {item.description}
      </Text>
    </TouchableOpacity>
  );
};
