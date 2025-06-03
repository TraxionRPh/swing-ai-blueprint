// src/components/SkillLevelStep.tsx
import React from "react";
import { View, Text } from "react-native";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";

interface SkillLevelStepProps {
  handicap: string;
  setHandicap: (value: string) => void;
}

const SkillLevelStep = ({ handicap, setHandicap }: SkillLevelStepProps) => {
  return (
    <View className="space-y-4 animate-fade-in">
      <Text className="text-lg font-medium">
        What's your golf skill level?
      </Text>

      <RadioGroup value={handicap} onValueChange={setHandicap}>
        <View className="flex-row items-center space-x-2 mb-2">
          <RadioGroupItem value="beginner" id="beginner" />
          <Text className="text-base">Beginner (36+ handicap)</Text>
        </View>

        <View className="flex-row items-center space-x-2 mb-2">
          <RadioGroupItem value="novice" id="novice" />
          <Text className="text-base">Novice (25-36 handicap)</Text>
        </View>

        <View className="flex-row items-center space-x-2 mb-2">
          <RadioGroupItem value="intermediate" id="intermediate" />
          <Text className="text-base">
            Intermediate (15-24 handicap)
          </Text>
        </View>

        <View className="flex-row items-center space-x-2 mb-2">
          <RadioGroupItem value="advanced" id="advanced" />
          <Text className="text-base">
            Advanced (5-14 handicap)
          </Text>
        </View>

        <View className="flex-row items-center space-x-2 mb-2">
          <RadioGroupItem value="expert" id="expert" />
          <Text className="text-base">Expert (0-4 handicap)</Text>
        </View>

        <View className="flex-row items-center space-x-2">
          <RadioGroupItem value="pro" id="pro" />
          <Text className="text-base">Professional (+ handicap)</Text>
        </View>
      </RadioGroup>
    </View>
  );
};

export default SkillLevelStep;
