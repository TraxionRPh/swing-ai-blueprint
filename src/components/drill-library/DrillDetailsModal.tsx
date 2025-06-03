// src/components/DrillDetailsModal.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Badge } from "@/components/ui/Badge"; // assume RN-compatible
import { Drill } from "@/types/drill";
import { PracticeTracker } from "./PracticeTracker";
import { WebView } from "react-native-webview";
import { X } from "lucide-react-native";

interface DrillDetailsModalProps {
  drill: Drill;
  isOpen: boolean;
  onClose: () => void;
}

export const DrillDetailsModal: React.FC<DrillDetailsModalProps> = ({
  drill,
  isOpen,
  onClose,
}) => {
  if (!drill) return null;

  const renderInstructions = () => {
    const instructions = [
      drill.instruction1,
      drill.instruction2,
      drill.instruction3,
      drill.instruction4,
      drill.instruction5,
    ].filter(Boolean);

    if (instructions.length === 0) return null;

    return (
      <View className="mt-6">
        <Text className="text-lg font-semibold mb-4">Instructions</Text>
        <View className="space-y-4">
          {instructions.map((instruction, index) => (
            <Text
              key={index}
              className="text-sm text-muted-foreground"
            >
              {instruction}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderCommonMistakes = () => {
    const mistakes = [
      drill.common_mistake1,
      drill.common_mistake2,
      drill.common_mistake3,
      drill.common_mistake4,
      drill.common_mistake5,
    ].filter(Boolean);

    if (mistakes.length === 0) return null;

    return (
      <View className="mt-6">
        <Text className="text-lg font-semibold mb-4">Common Mistakes</Text>
        <View className="space-y-4">
          {mistakes.map((mistake, index) => (
            <Text
              key={index}
              className="text-sm text-muted-foreground"
            >
              {mistake}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View className="bg-card rounded-lg max-h-[90%] w-[95%]">
          {/* Header with Close Button */}
          <View className="flex-row justify-end p-2">
            <TouchableOpacity onPress={onClose}>
              <X className="h-6 w-6 text-muted-foreground" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Title & Badge */}
            <View className="items-center space-y-2">
              <Text className="text-xl font-bold text-center">
                {drill.title}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {drill.duration}
              </Text>
              <Badge
                className={`
                  ${
                    drill.difficulty === "Beginner"
                      ? "bg-emerald-500 text-white"
                      : drill.difficulty === "Intermediate"
                      ? "bg-amber-500 text-white"
                      : "bg-rose-500 text-white"
                  } px-2 py-1 rounded-md
                `}
              >
                {drill.difficulty}
              </Badge>
            </View>

            {/* Overview */}
            <View className="mt-6">
              <Text className="text-sm text-muted-foreground">
                {drill.overview}
              </Text>
            </View>

            {/* Practice Tracker */}
            <View className="my-6">
              <PracticeTracker drill={drill} />
            </View>

            {renderInstructions()}
            {renderCommonMistakes()}

            {/* Pro Tip */}
            {drill.pro_tip && (
              <View className="mt-6 bg-[#FEF7CD] border border-yellow-300/50 p-4 rounded-md">
                <Text className="text-lg font-semibold mb-4 text-gray-800">
                  Pro Tip
                </Text>
                <Text className="text-sm text-gray-700">
                  {drill.pro_tip}
                </Text>
              </View>
            )}

            {/* Video Tutorial */}
            {drill.video_url && (
              <View className="mt-6">
                <Text className="text-lg font-semibold mb-4">
                  Video Tutorial
                </Text>
                <View className="w-full h-56 rounded-lg overflow-hidden">
                  <WebView
                    source={{ uri: drill.video_url }}
                    style={{ width: screenWidth * 0.9, height: 200 }}
                    javaScriptEnabled
                    domStorageEnabled
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
