// src/components/AllDrillsSection.tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Drill } from "@/types/drill";
import { DrillFilters } from "./DrillFilters";
import { DrillCard } from "./DrillCard";

interface AllDrillsSectionProps {
  drills: Drill[] | null;
  filteredDrills: Drill[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string | null;
  setSelectedDifficulty: (difficulty: string | null) => void;
}

export const AllDrillsSection = ({
  drills,
  filteredDrills,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
}: AllDrillsSectionProps) => {
  return (
    <View>
      <Text className="text-xl font-semibold mb-4">All Drills</Text>

      <ScrollView
        className="h-[600px]"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {drills && (
          <View className="mb-4">
            <DrillFilters
              drills={drills}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
            />
          </View>
        )}

        <View className="flex-row flex-wrap gap-4 mt-6">
          {filteredDrills.map((drill) => (
            <View key={drill.id} className="w-full md:w-1/2 lg:w-1/3 mb-4">
              <DrillCard drill={drill} />
            </View>
          ))}
        </View>

        {filteredDrills.length === 0 && (
          <View className="text-center py-10">
            <Text className="text-muted-foreground">
              No drills match your filters.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
