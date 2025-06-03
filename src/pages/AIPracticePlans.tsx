// AIPracticePlans.native.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { PracticePlanForm } from "@/components/practice-plans/PracticePlanForm";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useProfile, HandicapLevel } from "@/hooks/useProfile";
import { CommonProblem } from "@/types/practice-plan";
import { Button } from "@/components/ui/Button";
import { Link, useNavigate } from "react-router-native";
import { ListTodo } from "lucide-react-native";

const AIPracticePlans: React.FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [planDuration, setPlanDuration] = useState("1");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isManualAnalyzing, setIsManualAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { generatePlan, isGenerating } = useAIAnalysis();
  const { handicap } = useProfile();

  const commonProblems: CommonProblem[] = [
    {
      id: 1,
      problem: "Slicing Driver",
      description: "Ball curves dramatically right (for right-handed golfers)",
      popularity: "High",
    },
    {
      id: 2,
      problem: "Inconsistent Putting",
      description: "Difficulty controlling distance and direction on the green",
      popularity: "High",
    },
    {
      id: 3,
      problem: "Topping the Ball",
      description: "Hitting the top half of the ball, resulting in a low shot",
      popularity: "Medium",
    },
    {
      id: 4,
      problem: "Chunking Iron Shots",
      description: "Hitting the ground before the ball, taking too much turf",
      popularity: "Medium",
    },
    {
      id: 5,
      problem: "Poor Bunker Play",
      description: "Difficulty getting out of sand traps consistently",
      popularity: "Medium",
    },
  ];

  const generateAnalysis = async (isAI: boolean) => {
    if (!isAI && !inputValue.trim() && !handicap) {
      toast({
        title: "Missing Input",
        description:
          "Please describe your golf issue or tap the AI Generate button",
        variant: "destructive",
      });
      return;
    }

    if (isAI) {
      setIsAiAnalyzing(true);
    } else {
      setIsManualAnalyzing(true);
    }

    try {
      await generatePlan(
        user?.id,
        isAI ? "" : inputValue,
        handicap as HandicapLevel,
        planDuration
      );
      toast({
        title: "Practice Plan Generated",
        description: "AI has created a personalized practice plan for you",
      });

      // Navigate to the “My Plans” screen and show the latest
      navigate("/my-practice-plans", { state: { showLatest: true } });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate practice plan",
        variant: "destructive",
      });
      console.error("Error generating practice plan:", error);
    } finally {
      setIsAiAnalyzing(false);
      setIsManualAnalyzing(false);
    }
  };

  const handleSelectProblem = (problem: string) => {
    setInputValue(problem);
  };

  const handlePlanDurationChange = (duration: string) => {
    setPlanDuration(duration);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>AI Practice Plan Generator</Text>
          <Text style={styles.subtitle}>
            Get personalized practice plans based on your performance
          </Text>
        </View>
        <Button
          variant="outline"
          style={styles.myPlansButton}
          onPress={() => navigate("/my-practice-plans")}
        >
          <View style={styles.buttonContent}>
            <ListTodo size={16} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>My Plans</Text>
          </View>
        </Button>
      </View>

      <PracticePlanForm
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={(isAI) => generateAnalysis(isAI)}
        onSelectProblem={handleSelectProblem}
        isAiGenerating={isAiAnalyzing || isGenerating}
        isManualGenerating={isManualAnalyzing}
        commonProblems={commonProblems}
        planDuration={planDuration}
        onPlanDurationChange={handlePlanDurationChange}
      />
    </ScrollView>
  );
};

export default AIPracticePlans;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  titleContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827", // dark gray
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280", // muted-foreground
    marginTop: 8,
    textAlign: "center",
  },
  myPlansButton: {
    width: "100%",
    borderColor: "#3B82F6", // example outline color
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
});
