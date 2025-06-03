// src/components/FocusAreaSelector.tsx
import React from "react";
import { View, Text } from "react-native";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";

interface FocusAreaSelectorProps {
  focus: string;
  onChange: (value: string) => void;
}

export const FocusAreaSelector = ({
  focus,
  onChange,
}: FocusAreaSelectorProps) => {
  return (
    <View className="space-y-4">
      <Text className="text-lg font-medium">Focus Areas</Text>
      <RadioGroup value={focus} onValueChange={onChange}>
        <View className="flex-row flex-wrap justify-between gap-4">
          <View className="flex-row items-center space-x-2 w-[48%]">
            <RadioGroupItem value="balanced" id="focus-balanced" />
            <Text>Balanced Practice</Text>
          </View>
          <View className="flex-row items-center space-x-2 w-[48%]">
            <RadioGroupItem value="driving" id="focus-driving" />
            <Text>Driving Improvement</Text>
          </View>
          <View className="flex-row items-center space-x-2 w-[48%]">
            <RadioGroupItem value="iron-play" id="focus-iron" />
            <Text>Iron Play</Text>
          </View>
          <View className="flex-row items-center space-x-2 w-[48%]">
            <RadioGroupItem value="short-game" id="focus-short" />
            <Text>Short Game</Text>
          </View>
          <View className="flex-row items-center space-x-2 w-[48%]">
            <RadioGroupItem value="putting" id="focus-putting" />
            <Text>Putting</Text>
          </View>
          <View className="flex-row items-center space-x-2 w-[48%]">
            <RadioGroupItem value="weaknesses" id="focus-weaknesses" />
            <Text>Target Weaknesses</Text>
          </View>
        </View>
      </RadioGroup>
    </View>
  );
};
