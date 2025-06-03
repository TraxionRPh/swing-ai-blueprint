// src/components/ProgressIndicator.tsx
import React from "react";
import { View } from "react-native";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) => {
  return (
    <View className="flex-row justify-between mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View key={index} className="flex-1 flex-row items-center">
          {index > 0 && <View className="w-2" />}
          <View
            className={`h-2 flex-1 rounded-full ${
              currentStep >= index + 1 ? "bg-primary" : "bg-muted"
            }`}
          />
        </View>
      ))}
    </View>
  );
};

export default ProgressIndicator;
