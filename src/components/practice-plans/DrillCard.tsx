// src/components/DrillCard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Drill } from "@/types/drill";
import { Card, CardContent } from "@/components/ui/Card"; // RN-compatible Card
import { Checkbox } from "@/components/ui/Checkbox"; // RN-compatible Checkbox
import { Badge } from "@/components/ui/Badge"; // RN-compatible Badge
import { DrillDetailsDialog } from "./DrillDetailsDialog";
import { cn } from "@/lib/utils";

interface DrillCardProps {
  drill: Drill;
  sets: number;
  reps: number;
  isCompleted: boolean;
  onComplete: () => void;
}

export const DrillCard = ({
  drill,
  sets,
  reps,
  isCompleted,
  onComplete,
}: DrillCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!drill) return null;

  const getDifficultyColor = (difficulty: string) => {
    const lowerDifficulty = difficulty.toLowerCase();
    switch (lowerDifficulty) {
      case "beginner":
        return "bg-emerald-500 hover:bg-emerald-600 text-white";
      case "intermediate":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "advanced":
        return "bg-rose-500 hover:bg-rose-600 text-white";
      default:
        return "bg-slate-500 hover:bg-slate-600 text-white";
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowDetails(true)}
        activeOpacity={0.8}
      >
        <Card
          className={cn(
            "group transition-all duration-200",
            isCompleted ? "bg-primary/5" : "bg-background",
            "rounded-lg border border-border/50"
          )}
        >
          <CardContent className="p-4 space-y-4">
            <View className="flex-row justify-between items-start gap-3">
              <View className="flex-row items-start gap-3 min-h-[28px]">
                <View className="mt-1">
                  <Checkbox
                    value={isCompleted}
                    onValueChange={onComplete}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={cn(
                      "text-lg font-semibold leading-tight mb-1",
                      isCompleted && "text-muted-foreground line-through"
                    )}
                  >
                    {drill.title}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mt-1 flex-wrap">
                    <Badge
                      className={cn(
                        "text-xs font-normal",
                        getDifficultyColor(drill.difficulty || "beginner")
                      )}
                    >
                      {drill.difficulty || "Beginner"}
                    </Badge>
                    {drill.category && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {drill.category}
                      </Badge>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <Text className="text-sm text-muted-foreground">
              {sets} sets of {reps} reps • {drill.duration || "10-15 minutes"}
            </Text>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <DrillDetailsDialog
        drill={drill}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};
