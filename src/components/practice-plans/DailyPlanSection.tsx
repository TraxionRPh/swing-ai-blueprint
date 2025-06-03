// src/components/DailyPlanSection.tsx
import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"; // RN-compatible Card
import { Button } from "@/components/ui/Button"; // RN-compatible Button
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { DrillCard } from "./DrillCard"; // Adjusted for RN
import { DayPlan } from "@/types/practice-plan";

interface DrillWithSets {
  drill: { id: string; title: string } | null;
  sets: number;
  reps: number;
}

interface DailyPlanSectionProps {
  dayPlan: DayPlan;
  dayNumber: number;
  completedDrills: Record<string, boolean>;
  onDrillComplete: (drillName: string) => void;
}

export const DailyPlanSection = ({
  dayPlan,
  dayNumber,
  completedDrills,
  onDrillComplete,
}: DailyPlanSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Ensure drills array
  const drills: DrillWithSets[] = Array.isArray(dayPlan?.drills)
    ? dayPlan.drills
    : [];

  // Calculate completion percentage
  const { totalDrills, completedCount, completionPercentage } = useMemo(() => {
    const total = drills.length;
    const completed = drills.filter((d) => {
      if (!d.drill) return false;
      return completedDrills[d.drill.title];
    }).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { totalDrills: total, completedCount: completed, completionPercentage: percent };
  }, [drills, completedDrills]);

  // Format focus text
  const focusText = useMemo(() => {
    if (dayPlan?.focus && dayPlan.focus.startsWith(`Day ${dayNumber}: `)) {
      return dayPlan.focus.substring(`Day ${dayNumber}: `.length);
    }
    return dayPlan?.focus || "";
  }, [dayPlan, dayNumber]);

  return (
    <Card>
      <TouchableOpacity onPress={toggleOpen}>
        <CardHeader className="bg-muted/50 py-3">
          <View className="space-y-1">
            <CardTitle className="text-lg flex-row justify-between items-center">
              <Text>
                Day {dayNumber}: {focusText}
              </Text>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </Button>
            </CardTitle>
            <View className="flex-row items-center gap-3 mt-1">
              <Text className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm">
                {completionPercentage}% Complete
              </Text>
              <Text className="text-sm text-muted-foreground">
                {dayPlan?.duration || "30 minutes"}
              </Text>
            </View>
          </View>
        </CardHeader>
      </TouchableOpacity>

      {isOpen && (
        <CardContent className="p-6">
          <View className="space-y-4">
            {drills.length > 0 ? (
              drills.map((drillWithSets, index) => {
                if (!drillWithSets?.drill) return null;

                const drillObject = drillWithSets.drill;
                const isCompleted = !!completedDrills[drillObject.title];

                return (
                  <DrillCard
                    key={`${dayNumber}-${index}-${drillObject.id}`}
                    drill={drillObject}
                    sets={drillWithSets.sets}
                    reps={drillWithSets.reps}
                    isCompleted={isCompleted}
                    onComplete={() => onDrillComplete(drillObject.title)}
                  />
                );
              })
            ) : (
              <Text className="text-amber-600">
                No drills available for this day.
              </Text>
            )}
          </View>
        </CardContent>
      )}
    </Card>
  );
};
