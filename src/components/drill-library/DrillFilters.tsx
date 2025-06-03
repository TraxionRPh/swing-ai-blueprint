// src/components/DrillFilters.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Drill } from "@/types/drill";

interface DrillFiltersProps {
  drills: Drill[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string | null;
  setSelectedDifficulty: (difficulty: string | null) => void;
}

export const DrillFilters: React.FC<DrillFiltersProps> = ({
  drills,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
}) => {
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [difficulties, setDifficulties] = useState<string[]>([]);

  useEffect(() => {
    if (!drills || drills.length === 0) return;

    const uniqueCategories = [
      "all",
      ...Array.from(new Set(drills.map((drill) => drill.category))),
    ];
    setCategories(uniqueCategories);

    // Predefined order for difficulties
    const difficultyOrder = ["Beginner", "Intermediate", "Advanced"];
    const uniqueDifficulties = Array.from(
      new Set(drills.map((drill) => drill.difficulty))
    ).sort((a, b) => {
      const indexA = difficultyOrder.indexOf(a);
      const indexB = difficultyOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    setDifficulties(uniqueDifficulties);
  }, [drills]);

  return (
    <View className="space-y-4">
      {/* Category Tabs as horizontal scroll buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
      >
        {categories.map((category) => {
          const isActive = category === selectedCategory;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`
                mx-1 px-4 py-2 rounded-md
                ${isActive
                  ? "bg-primary text-primary-foreground border-primary/50 border"
                  : "bg-background border border-transparent"}
              `}
            >
              <Text
                className={`
                  text-sm
                  ${isActive ? "text-primary-foreground" : "text-muted-foreground"}
                `}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Difficulty Badges */}
      <View className="flex-row flex-wrap gap-2">
        <TouchableOpacity
          onPress={() => setSelectedDifficulty(null)}
          className={`
            px-3 py-1.5 rounded-full
            ${selectedDifficulty === null
              ? "bg-primary text-primary-foreground"
              : "bg-transparent border border-primary/50"}
          `}
        >
          <Text
            className={`
              text-xs
              ${selectedDifficulty === null
                ? "text-primary-foreground"
                : "text-muted-foreground"}
            `}
          >
            All Difficulties
          </Text>
        </TouchableOpacity>

        {difficulties.map((difficulty) => {
          const isActive = selectedDifficulty === difficulty;
          return (
            <TouchableOpacity
              key={difficulty}
              onPress={() =>
                setSelectedDifficulty(isActive ? null : difficulty)
              }
              className={`
                px-3 py-1.5 rounded-full
                ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent border border-primary/50"}
              `}
            >
              <Text
                className={`
                  text-xs
                  ${isActive ? "text-primary-foreground" : "text-muted-foreground"}
                `}
              >
                {difficulty}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
