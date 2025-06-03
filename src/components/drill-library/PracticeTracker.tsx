// src/components/PracticeTracker.tsx
import React from "react";
import { View, Text } from "react-native";
import {
  Button,
} from "@/components/ui/Button";
import {
  Play,
  CircleStop,
  Pause,
  Play as ResumeIcon,
} from "lucide-react-native";
import { Drill } from "@/types/drill";
import { usePracticeTracking } from "@/hooks/usePracticeTracking";

interface PracticeTrackerProps {
  drill: Drill;
}

export const PracticeTracker = ({ drill }: PracticeTrackerProps) => {
  const {
    isTracking,
    isPaused,
    formattedTime,
    startPractice,
    pausePractice,
    completePractice,
  } = usePracticeTracking(drill);

  return (
    <View className="flex flex-col space-y-4">
      {isTracking ? (
        <View className="flex flex-col sm:flex-row items-center gap-4">
          {/* Timer Display */}
          <View className="bg-secondary/20 px-4 py-2 rounded-md min-w-[100px]">
            <Text className="text-2xl font-mono text-center">
              {formattedTime}
            </Text>
          </View>

          {/* Pause/Resume & Complete Buttons */}
          <View className="flex-row gap-3 flex-1 justify-start">
            <Button
              variant="outline"
              onPress={pausePractice}
              className="flex-1 sm:flex-none"
              size="sm"
            >
              <View className="flex-row items-center">
                {isPaused ? (
                  <>
                    <ResumeIcon className="h-4 w-4" />
                    <Text className="ml-2">Resume</Text>
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    <Text className="ml-2">Pause</Text>
                  </>
                )}
              </View>
            </Button>

            <Button
              variant="destructive"
              onPress={completePractice}
              className="flex-1 sm:flex-none"
              size="sm"
            >
              <View className="flex-row items-center">
                <CircleStop className="h-4 w-4" />
                <Text className="ml-2">Complete</Text>
              </View>
            </Button>
          </View>
        </View>
      ) : (
        <Button
          onPress={startPractice}
          className="w-full sm:w-auto"
        >
          <View className="flex-row items-center">
            <Play className="h-4 w-4" />
            <Text className="ml-2">Start Practice</Text>
          </View>
        </Button>
      )}
    </View>
  );
};
