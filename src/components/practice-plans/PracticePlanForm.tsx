import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Brain } from "@/components/icons/CustomIcons";
import { CommonProblemCard } from "./CommonProblemCard";
import { PlanDurationDialog } from "./PlanDurationDialog";
import { CommonProblem } from "@/types/practice-plan";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PracticePlanFormProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (isAI: boolean) => void;
  onSelectProblem: (problem: string) => void;
  isAiGenerating: boolean;
  isManualGenerating: boolean;
  commonProblems: CommonProblem[];
  planDuration: string;
  onPlanDurationChange: (duration: string) => void;
}

export const PracticePlanForm = ({
  inputValue,
  onInputChange,
  onSubmit,
  onSelectProblem,
  isAiGenerating,
  isManualGenerating,
  commonProblems,
  planDuration,
  onPlanDurationChange,
}: PracticePlanFormProps) => {
  const [showDurationDialog, setShowDurationDialog] = useState(false);
  const [isAIGeneration, setIsAIGeneration] = useState(false);
  const [enhancedInput, setEnhancedInput] = useState("");

  useEffect(() => {
    let processedInput = inputValue;
    const lower = inputValue.toLowerCase();

    const isPuttingQuery =
      lower.includes("putt") ||
      lower.includes("green") ||
      lower.includes("read") ||
      lower.includes("lag");
    const isDrivingQuery =
      lower.includes("driver") ||
      lower.includes("tee shot") ||
      lower.includes("off the tee") ||
      lower.includes("slice") ||
      lower.includes("hook");
    const isIronQuery =
      lower.includes("iron") ||
      lower.includes("approach") ||
      lower.includes("ball striking") ||
      lower.includes(" mid game") ||
      lower.includes("contact");
    const isChippingQuery =
      lower.includes("chip") ||
      lower.includes("pitch") ||
      lower.includes("short game") ||
      lower.includes("around the green");
    const isBunkerQuery =
      lower.includes("bunker") || lower.includes("sand");

    if (isPuttingQuery) {
      processedInput = `STRICTLY PUTTING ONLY: ${inputValue} - THIS IS A PUTTING-ONLY PLAN: ONLY use drills with category="putting". NO other drill types allowed.`;
    } else if (isDrivingQuery) {
      processedInput = `STRICTLY DRIVING ONLY: ${inputValue} - THIS IS A DRIVING-ONLY PLAN: ONLY use drills with categories related to driving, tee shots, or long game. NO other drill types allowed.`;
    } else if (isIronQuery) {
      processedInput = `STRICTLY IRON PLAY ONLY: ${inputValue} - THIS IS AN IRON PLAY PLAN: ONLY use drills with categories related to irons, approach shots, or ball striking. NO other drill types allowed.`;
    } else if (isChippingQuery) {
      processedInput = `STRICTLY SHORT GAME ONLY: ${inputValue} - THIS IS A SHORT GAME PLAN: ONLY use drills with categories related to chipping, pitching, or short game. NO other drill types allowed.`;
    } else if (isBunkerQuery) {
      processedInput = `STRICTLY BUNKER PLAY ONLY: ${inputValue} - THIS IS A BUNKER/SAND PLAN: ONLY use drills with categories related to bunkers or sand shots. NO other drill types allowed.`;
    }

    setEnhancedInput(processedInput);
  }, [inputValue]);

  const needsCategoryEnhancement = (text: string): boolean => {
    const lower = text.toLowerCase();
    return (
      lower.includes("putt") ||
      lower.includes("green") ||
      lower.includes("driver") ||
      lower.includes("slice") ||
      lower.includes("hook") ||
      lower.includes("iron") ||
      lower.includes("approach") ||
      lower.includes("chip") ||
      lower.includes("pitch") ||
      lower.includes("bunker") ||
      lower.includes("sand")
    );
  };

  const handleGenerateClick = (isAI: boolean) => {
    setIsAIGeneration(isAI);
    setShowDurationDialog(true);
  };

  const handleConfirmDuration = () => {
    setShowDurationDialog(false);

    if (
      needsCategoryEnhancement(inputValue) &&
      inputValue !== enhancedInput
    ) {
      onInputChange(enhancedInput);
      setTimeout(() => {
        onSubmit(isAIGeneration);
      }, 100);
    } else {
      onSubmit(isAIGeneration);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Practice Plan</Text>
          <Text style={styles.description}>
            Get a personalized practice plan based on your specific golf needs
          </Text>
        </View>

        <View style={styles.content}>
          {/* AI-Generated Button */}
          <TouchableOpacity
            style={[
              styles.aiButton,
              (isAiGenerating || isManualGenerating) && styles.buttonDisabled,
            ]}
            onPress={() => handleGenerateClick(true)}
            disabled={isAiGenerating || isManualGenerating}
          >
            <Brain style={styles.brainIcon} />
            <Text style={styles.aiButtonText}>
              {isAiGenerating
                ? "Analyzing Your Data..."
                : "Create Personalized AI Practice Plan"}
            </Text>
          </TouchableOpacity>

          {/* OR Separator */}
          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Manual Input */}
          <TextInput
            style={styles.textarea}
            placeholder="Describe your golf issue in detail (e.g., 'I'm slicing my driver' or 'I'm struggling with distance control in my putting')"
            multiline
            value={inputValue}
            onChangeText={onInputChange}
          />

          <TouchableOpacity
            style={[
              styles.manualButton,
              (isAiGenerating || isManualGenerating) && styles.buttonDisabled,
            ]}
            onPress={() => handleGenerateClick(false)}
            disabled={isAiGenerating || isManualGenerating}
          >
            <Text style={styles.manualButtonText}>
              {isManualGenerating
                ? "Generating Practice Plan..."
                : "Generate Practice Plan"}
            </Text>
          </TouchableOpacity>

          {/* Common Problems Section */}
          <View style={styles.problemsSection}>
            <Text style={styles.problemsHeading}>Common Problems</Text>
            <View style={styles.problemsGrid}>
              {commonProblems.map((item: CommonProblem) => (
                <CommonProblemCard
                  key={item.id}
                  item={item}
                  onSelect={onSelectProblem}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Duration Dialog */}
        <PlanDurationDialog
          isOpen={showDurationDialog}
          onClose={() => setShowDurationDialog(false)}
          planDuration={planDuration}
          onPlanDurationChange={onPlanDurationChange}
          onConfirm={handleConfirmDuration}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingBottom: 16,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize:  fourteen,
    color: "#555",
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8e44ad", // Purple
    paddingVertical: 14,
    borderRadius: 6,
  },
  brainIcon: {
    marginRight: 8,
  },
  aiButtonText: {
    color: "#fff",
    fontSize:  sixteen,
    fontWeight: "500",
    textAlign: "center",
  },
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical:  sixteen,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  separatorText: {
    marginHorizontal:  eight,
    fontSize:  fourteen,
    color: "#888",
  },
  textarea: {
    height: 120,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: "top",
    fontSize:  sixteen,
    marginBottom:  twelve,
  },
  manualButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom:  sixteen,
  },
  manualButtonText: {
    color: "#fff",
    fontSize:  sixteen,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  problemsSection: {
    marginTop:  twelve,
  },
  problemsHeading: {
    fontSize:  eighteen,
    fontWeight: "600",
    marginBottom:  eight,
  },
  problemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
