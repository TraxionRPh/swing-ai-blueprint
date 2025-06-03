// src/components/DailyPlanCard.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox } from "@/components/ui/Checkbox"; // RN-compatible Checkbox
import { Button } from "@/components/ui/Button"; // RN-compatible Button
import { useToast } from "@/hooks/use-toast";
import { DrillDetailsDialog } from "./DrillDetailsDialog";
import { DayPlan } from "@/types/practice-plan";
import { Drill } from "@/types/drill";

interface DailyPlanCardProps {
  dayPlan: DayPlan;
  dayNumber: number;
  completedDrills: Record<string, boolean>;
  onDrillComplete: (drillName: string) => void;
  planId?: string;
}

export const DailyPlanCard = ({
  dayPlan,
  dayNumber,
  completedDrills,
  onDrillComplete,
  planId,
}: DailyPlanCardProps) => {
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [savedCompleted, setSavedCompleted] = useState<Record<string, boolean>>(
    completedDrills
  );
  const { toast } = useToast();

  // Load saved state from AsyncStorage
  useEffect(() => {
    if (!planId) return;
    const load = async () => {
      try {
        const key = `completed-drills-${planId}`;
        const json = await AsyncStorage.getItem(key);
        if (json) {
          setSavedCompleted(JSON.parse(json));
        }
      } catch (e) {
        console.error("Error loading completed drills:", e);
      }
    };
    load();
  }, [planId]);

  const handleDrillToggle = useCallback(
    async (drillTitle: string) => {
      onDrillComplete(drillTitle);
      const newState = {
        ...savedCompleted,
        [drillTitle]: !savedCompleted[drillTitle],
      };
      setSavedCompleted(newState);

      if (planId) {
        try {
          const key = `completed-drills-${planId}`;
          await AsyncStorage.setItem(key, JSON.stringify(newState));
        } catch (e) {
          console.error("Error saving completed drills:", e);
          toast({
            title: "Error",
            description: "Could not save drill completion state.",
            variant: "destructive",
          });
        }
      }
    },
    [savedCompleted, onDrillComplete, planId, toast]
  );

  return (
    <View className="border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <View className="bg-muted p-3 border-b">
        <Text className="font-medium">
          Day {dayNumber}: {dayPlan.focus}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {dayPlan.duration}
        </Text>
      </View>

      {/* Drills List */}
      <View className="p-3">
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          {dayPlan.drills.map((drillWithSets, j) => {
            const drillObject = drillWithSets.drill;
            if (!drillObject) return null;
            const isCompleted = !!savedCompleted[drillObject.title];

            return (
              <View
                key={j}
                className="border rounded-md overflow-hidden bg-background mb-3"
              >
                <View className="flex-row items-center p-3">
                  <Checkbox
                    value={isCompleted}
                    onValueChange={() => handleDrillToggle(drillObject.title)}
                    className="mr-3"
                  />
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text
                          className={`text-sm font-medium ${
                            isCompleted
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {drillObject.title}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {drillWithSets.sets} sets of {drillWithSets.reps} reps
                        </Text>
                      </View>
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => setSelectedDrill(drillObject)}
                        className="ml-2"
                      >
                        <Text>View Details</Text>
                      </Button>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Drill Details Dialog */}
      <DrillDetailsDialog
        drill={selectedDrill}
        isOpen={!!selectedDrill}
        onClose={() => setSelectedDrill(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Add any custom styles if needed
});
