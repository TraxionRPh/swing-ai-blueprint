// src/components/GeneratedPlan.tsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"; // RN‐compatible Card
import { Button } from "@/components/ui/Button"; // RN‐compatible Button
import { ArrowLeft } from "lucide-react-native";
import { useToast } from "@/hooks/use-toast";
import { GeneratedPracticePlan, DayPlan, DrillWithSets } from "@/types/practice-plan";
import { Drill } from "@/types/drill";
import { Challenge } from "@/types/challenge";
import { DiagnosisCard } from "./DiagnosisCard"; // assume RN‐compatible
import { DailyPlanSection } from "./DailyPlanSection"; // RN‐compatible
import { ChallengeScore } from "./ChallengeScore"; // RN‐compatible (uses AsyncStorage)

interface GeneratedPlanProps {
  plan: GeneratedPracticePlan;
  onClear: () => void;
  planDuration?: string;
  planId?: string;
}

const ChallengeCard = ({
  title,
  description,
  instructions,
  attempts,
  planId,
  type,
}: {
  title: string;
  description: string;
  instructions: string[];
  attempts: number;
  planId?: string;
  type: "initial" | "final";
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex-row justify-between items-center">
        <Text>
          {type === "initial" ? "Initial Challenge: " : "Final Challenge: "}
          {title}
        </Text>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Text className="text-muted-foreground mb-4">{description}</Text>
      <View className="space-y-4">
        {instructions.map(
          (instruction, i) =>
            instruction && (
              <Text key={i}>
                {i + 1}. {instruction}
              </Text>
            )
        )}
      </View>
      <View className="mt-4">
        <ChallengeScore planId={planId} type={type} attempts={attempts} />
      </View>
    </CardContent>
  </Card>
);

export const GeneratedPlan = ({
  plan,
  onClear,
  planDuration = "1",
  planId,
}: GeneratedPlanProps) => {
  const { toast } = useToast();
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>({});

  // Load completed drills from AsyncStorage
  useEffect(() => {
    if (!planId) return;
    const loadCompleted = async () => {
      try {
        const key = `completed-drills-${planId}`;
        const json = await AsyncStorage.getItem(key);
        if (json) {
          setCompletedDrills(JSON.parse(json));
        }
      } catch (e) {
        console.error("Error loading completed drills:", e);
      }
    };
    loadCompleted();
  }, [planId]);

  const toggleDrillCompletion = useCallback(
    async (drillName: string) => {
      const newState = !completedDrills[drillName];
      const updated = {
        ...completedDrills,
        [drillName]: newState,
      };
      setCompletedDrills(updated);

      if (planId) {
        try {
          const key = `completed-drills-${planId}`;
          await AsyncStorage.setItem(key, JSON.stringify(updated));
          toast({
            title: newState ? "Drill completed!" : "Drill marked as incomplete",
            description: `${drillName} ${
              newState ? "marked as completed" : "marked as not completed"
            }`,
            variant: "default",
          });
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
    [completedDrills, planId, toast]
  );

  const processedPlanDays = usePlanData(plan, planDuration);

  const displayChallenge = useChallenge(plan.problem, plan.practicePlan?.challenge);

  const challengeInstructions = [
    displayChallenge.instruction1,
    displayChallenge.instruction2,
    displayChallenge.instruction3,
  ].filter(Boolean) as string[];

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} className="space-y-6">
      <Button variant="outline" onPress={onClear} className="mb-2">
        <View className="flex-row items-center">
          <ArrowLeft className="mr-2 h-4 w-4 text-foreground" />
          <Text>Back to Plans</Text>
        </View>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Practice Plan: {plan.problem}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-muted-foreground">
            This practice plan is designed to improve your{" "}
            {plan.problem.toLowerCase()} through targeted drills and exercises.
            Complete the recommended drills over {planDuration}{" "}
            {parseInt(planDuration, 10) === 1 ? "day" : "days"} to see improvement.
          </Text>
        </CardContent>
      </Card>

      <ChallengeCard
        title={displayChallenge.title}
        description={displayChallenge.description}
        instructions={challengeInstructions}
        attempts={displayChallenge.attempts || 9}
        planId={planId}
        type="initial"
      />

      <DiagnosisCard
        diagnosis={plan.diagnosis}
        rootCauses={plan.rootCauses}
        isAIGenerated={plan.isAIGenerated}
        problem={plan.problem}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daily Drills Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {processedPlanDays.length > 0 ? (
            processedPlanDays.map((dayPlan, i) => (
              <DailyPlanSection
                key={`day-${i + 1}-${dayPlan.day}`}
                dayPlan={dayPlan}
                dayNumber={i + 1}
                completedDrills={completedDrills}
                onDrillComplete={toggleDrillCompletion}
              />
            ))
          ) : (
            <Text className="text-muted-foreground">
              No drills available for this practice plan.
            </Text>
          )}
        </CardContent>
      </Card>

      <ChallengeCard
        title={displayChallenge.title}
        description="Complete this challenge again to measure your improvement"
        instructions={challengeInstructions}
        attempts={displayChallenge.attempts || 9}
        planId={planId}
        type="final"
      />
    </ScrollView>
  );
};

function usePlanData(
  plan: GeneratedPracticePlan,
  planDuration: string = "1"
): DayPlan[] {
  return useMemo(() => {
    console.log("Processing plan data with duration:", planDuration);

    const planData =
      plan.practicePlan?.plan && Array.isArray(plan.practicePlan.plan)
        ? plan.practicePlan.plan
        : [];

    if (planData.length === 0) {
      console.warn("No plan days found in practice plan");
    }

    const durationNum = parseInt(planDuration, 10) || 1;
    const filteredDays = planData.slice(0, durationNum);

    return filteredDays.map((day) => {
      const drills = Array.isArray(day.drills)
        ? day.drills.filter((d) => d && d.drill)
        : [];

      if (drills.length === 0) {
        console.warn(`Day ${day.day} has no valid drills after filtering`);
      }

      console.log(
        `Day ${day.day} valid drills:`,
        drills.map((d) => ({
          title: d.drill?.title || "Unknown",
          id: d.drill?.id || "No ID",
        }))
      );

      return {
        ...day,
        drills,
      };
    });
  }, [plan, planDuration]);
}

function useChallenge(
  problem: string,
  providedChallenge?: Challenge
): Challenge {
  const defaultChallenge = useMemo(
    () => getDefaultChallenge(problem),
    [problem]
  );

  const displayChallenge = useMemo(() => {
    const hasValidProvided =
      providedChallenge &&
      Object.keys(providedChallenge).length > 0 &&
      providedChallenge.instruction1;

    return hasValidProvided ? providedChallenge! : defaultChallenge;
  }, [providedChallenge, defaultChallenge]);

  if (!displayChallenge.attempts) {
    const instructionCount = [
      displayChallenge.instruction1,
      displayChallenge.instruction2,
      displayChallenge.instruction3,
    ].filter(Boolean).length;
    displayChallenge.attempts = instructionCount > 0 ? instructionCount * 3 : 9;
  }

  return displayChallenge;
}

function getDefaultChallenge(problem: string): Challenge {
  const defaultChallenge: Challenge = {
    id: "default-challenge",
    title: "Golf Skill Challenge",
    description: "Test your improvement with this personalized challenge",
    difficulty: "Medium",
    category: "General",
    metrics: ["Accuracy"],
    metric: "Accuracy",
    instruction1: "Complete the recommended practice drills",
    instruction2: "Apply the techniques in a controlled environment",
    instruction3: "Measure your improvement",
    attempts: 10,
  };

  const lower = problem.toLowerCase();

  if (
    lower.includes("topping") ||
    lower.includes("top") ||
    lower.includes("thin")
  ) {
    defaultChallenge.title = "Clean Contact Challenge";
    defaultChallenge.description =
      "Test your ability to make clean, ball-first contact";
    defaultChallenge.category = "Ball Striking";
    defaultChallenge.metrics = ["Clean Contacts"];
    defaultChallenge.metric = "Clean Contacts";
    defaultChallenge.instruction1 =
      "Set up to hit 10 mid-iron shots with a focus on maintaining posture";
    defaultChallenge.instruction2 =
      "Count how many shots have clean ball-first contact with a proper divot";
    defaultChallenge.instruction3 = "Record your clean contact percentage";
  } else if (lower.includes("putt")) {
    defaultChallenge.title = "Putting Accuracy Challenge";
    defaultChallenge.description =
      "Test your putting accuracy and consistency";
    defaultChallenge.category = "Putting";
    defaultChallenge.metrics = ["Putts Made"];
    defaultChallenge.metric = "Putts Made";
    defaultChallenge.instruction1 = "Set up 10 putts at 3 feet distance";
    defaultChallenge.instruction2 =
      "Count how many you make successfully";
    defaultChallenge.instruction3 = "Calculate your make percentage";
  } else if (
    lower.includes("driv") ||
    lower.includes("slice") ||
    lower.includes("hook")
  ) {
    defaultChallenge.title = "Fairway Accuracy Challenge";
    defaultChallenge.description =
      "Test your ability to hit fairways consistently with your driver";
    defaultChallenge.category = "Driving";
    defaultChallenge.metrics = ["Fairways Hit"];
    defaultChallenge.metric = "Fairways Hit";
    defaultChallenge.instruction1 = "Hit 10 drives aiming for the fairway";
    defaultChallenge.instruction2 = "Count how many land in the fairway";
    defaultChallenge.instruction3 =
      "Calculate your percentage of fairways hit";
  } else if (lower.includes("chip") || lower.includes("short game")) {
    defaultChallenge.title = "Short Game Proximity Challenge";
    defaultChallenge.description = "Test your ability to chip close to the pin";
    defaultChallenge.category = "Short Game";
    defaultChallenge.metrics = ["Proximity"];
    defaultChallenge.metric = "Proximity";
    defaultChallenge.instruction1 =
      "Chip 10 balls from 20 yards to a target";
    defaultChallenge.instruction2 =
      "Measure the distance of each shot from the target";
    defaultChallenge.instruction3 = "Calculate your average proximity";
  } else if (lower.includes("iron") || lower.includes("approach")) {
    defaultChallenge.title = "Iron Shot Accuracy Challenge";
    defaultChallenge.description =
      "Test your iron shot accuracy and distance control";
    defaultChallenge.category = "Iron Play";
    defaultChallenge.metrics = ["Greens Hit"];
    defaultChallenge.metric = "Greens Hit";
    defaultChallenge.instruction1 =
      "Hit 10 iron shots to a specific target";
    defaultChallenge.instruction2 =
      "Count how many land within 20 feet of the target";
    defaultChallenge.instruction3 =
      "Calculate your accuracy percentage";
  } else if (lower.includes("sand") || lower.includes("bunker")) {
    defaultChallenge.title = "Bunker Escape Challenge";
    defaultChallenge.description =
      "Test your ability to escape bunkers consistently";
    defaultChallenge.category = "Bunker Play";
    defaultChallenge.metrics = ["Successful Escapes"];
    defaultChallenge.metric = "Successful Escapes";
    defaultChallenge.instruction1 =
      "Hit 10 bunker shots aiming to get out in one attempt";
    defaultChallenge.instruction2 =
      "Count how many successfully exit the bunker and land on the green";
    defaultChallenge.instruction3 =
      "Calculate your bunker escape and accuracy percentage";
    defaultChallenge.attempts = 10;
  }

  return defaultChallenge;
}

const styles = StyleSheet.create({
  // Add custom styles if needed
});
