// PracticePlanGenerator.native.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocation, useNavigate } from "react-router-native";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Drill } from "@/types/drill";
import { DrillCard } from "@/components/drill-library/DrillCard";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Loading } from "@/components/ui/Loading";
import { PlanDurationDialog } from "@/components/practice-plans/PlanDurationDialog";
import { usePracticePlanGeneration } from "@/hooks/usePracticePlanGeneration";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const PracticePlanGenerator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDrills, setSelectedDrills] = useState<Drill[]>([]);
  const [showDurationDialog, setShowDurationDialog] = useState(false);
  const [planDuration, setPlanDuration] = useState("1");
  const { generatePlan, isGenerating } = usePracticePlanGeneration();

  // Extract focusArea and problem from navigation state
  const focusArea = (location.state as any)?.focusArea;
  const problem = (location.state as any)?.problem;

  // If problem exists, show duration dialog automatically
  useEffect(() => {
    if (problem) {
      setShowDurationDialog(true);
    }
  }, [problem]);

  // Parse drill IDs from URL query (?drills=...)
  const rawSearch = location.search || "";
  const searchParams = new URLSearchParams(rawSearch.startsWith("?") ? rawSearch : `?${rawSearch}`);
  const drillIdsParam = searchParams.get("drills");
  const drillIds = drillIdsParam ? drillIdsParam.split(",") : [];

  // Fetch selected drills
  const { data: drills, isLoading } = useQuery<Drill[]>({
    queryKey: ["selected-drills", drillIds],
    queryFn: async () => {
      if (!drillIds.length) return [];
      const { data, error } = await supabase
        .from("drills")
        .select("*")
        .in("id", drillIds);
      if (error) throw error;
      return data as Drill[];
    },
    enabled: drillIds.length > 0,
  });

  // Maintain order from drillIds
  useEffect(() => {
    if (drills) {
      const ordered = drillIds
        .map((id) => drills.find((d) => d.id === id))
        .filter((d): d is Drill => !!d);
      setSelectedDrills(ordered);
    }
  }, [drills, drillIds]);

  // Determine category of a single drill
  const getDrillCategory = useCallback((drill: Drill): string => {
    const cat = (drill.category || "").toLowerCase();
    if (cat.includes("putt")) return "putting";
    if (cat.includes("driver") || cat.includes("tee")) return "driving";
    if (cat.includes("iron") || cat.includes("approach")) return "iron_play";
    if (cat.includes("chip") || cat.includes("pitch") || cat.includes("short game"))
      return "short_game";
    if (cat.includes("bunker") || cat.includes("sand")) return "bunker";
    return "general";
  }, []);

  // Determine dominant category among selected drills
  const getDominantCategory = useCallback((drs: Drill[]): string => {
    if (!drs.length) return "general";
    const counts: Record<string, number> = {
      putting: 0,
      driving: 0,
      iron_play: 0,
      short_game: 0,
      bunker: 0,
      general: 0,
    };
    drs.forEach((d) => {
      const c = getDrillCategory(d);
      counts[c] = (counts[c] || 0) + 1;
    });
    let max = 0;
    let dom = "general";
    Object.entries(counts).forEach(([cat, cnt]) => {
      if (cnt > max) {
        max = cnt;
        dom = cat;
      }
    });
    return dom;
  }, [getDrillCategory]);

  // Open duration dialog when user clicks Generate
  const generatePracticeIssue = () => {
    if (selectedDrills.length === 0 && !problem) {
      toast({
        title: "No drills or issue selected",
        description:
          "Please select at least one drill for your practice plan or use a specific issue",
        variant: "destructive",
      });
      return;
    }
    setShowDurationDialog(true);
  };

  // Confirm duration: build issue and call generatePlan
  const handleConfirmDuration = async () => {
    setShowDurationDialog(false);
    try {
      let issue = problem;
      if (!issue && selectedDrills.length > 0) {
        const focusTags = selectedDrills.flatMap((d) => d.focus || []);
        const categories = [
          ...new Set(selectedDrills.map((d) => d.category)),
        ];
        const dominant = getDominantCategory(selectedDrills);
        issue = `Create a practice plan focusing on ${focusTags
          .slice(0, 3)
          .join(", ")} using drills for ${categories.join(" and ")}. Include drills: ${selectedDrills
          .map((d) => d.title)
          .join(", ")}`;
        switch (dominant) {
          case "putting":
            issue = `STRICTLY PUTTING ONLY: ${issue} - THIS IS A PUTTING-ONLY PRACTICE PLAN: ONLY use putting drills with category="putting".`;
            break;
          case "driving":
            issue = `STRICTLY DRIVING ONLY: ${issue} - THIS IS A DRIVING-ONLY PRACTICE PLAN: ONLY use driving drills related to tee shots and long game.`;
            break;
          case "iron_play":
            issue = `STRICTLY IRON PLAY ONLY: ${issue} - THIS IS AN IRON PLAY PLAN: ONLY use drills related to iron shots and approach shots.`;
            break;
          case "short_game":
            issue = `STRICTLY SHORT GAME ONLY: ${issue} - THIS IS A SHORT GAME PLAN: ONLY use chipping and pitching drills.`;
            break;
          case "bunker":
            issue = `STRICTLY BUNKER PLAY ONLY: ${issue} - THIS IS A BUNKER/SAND PLAN: ONLY use drills for bunker shots and sand play.`;
            break;
        }
      }
      if (focusArea && issue && !issue.includes(focusArea)) {
        issue = `Improve ${focusArea}: ${issue}`;
      }
      if (!issue) {
        toast({
          title: "Missing practice issue",
          description:
            "Could not determine what to focus on for your practice plan",
          variant: "destructive",
        });
        return;
      }
      await generatePlan(user?.id, issue, undefined, planDuration);
      toast({
        title: "Practice Plan Generated",
        description: "Your custom practice plan has been created",
      });
      navigate("/my-practice-plans");
    } catch (err) {
      console.error("Error generating practice plan:", err);
      toast({
        title: "Generation Failed",
        description: "There was a problem creating your practice plan",
        variant: "destructive",
      });
    }
  };

  const goToDrillLibrary = () => {
    navigate("/drills");
  };

  if (isLoading && drillIds.length > 0) {
    return (
      <Loading message="Loading selected drills..." />
    );
  }

  if (isGenerating) {
    return (
      <Loading
        message={`Creating practice plan for ${
          focusArea || "your golf skills"
        }...`}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Practice Plan Generator</Text>
        <Text style={styles.subtitle}>
          {problem
            ? `Creating a personalized practice plan to address: ${problem}`
            : "Create a personalized practice plan based on these selected drills"}
        </Text>
        {focusArea && (
          <Text style={styles.focusArea}>Focus Area: {focusArea}</Text>
        )}
      </View>

      {!problem && selectedDrills.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Drills Selected</CardTitle>
            <CardDescription>
              You need to select drills to generate a practice plan
            </CardDescription>
          </CardHeader>
          <CardContent style={styles.centerContent}>
            <Button onPress={goToDrillLibrary}>
              <Text style={styles.buttonText}>Go to Drill Library</Text>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {selectedDrills.length > 0 && (
            <Card style={styles.cardMargin}>
              <CardHeader>
                <CardTitle>Selected Drills</CardTitle>
                <CardDescription>
                  {selectedDrills.length} drill
                  {selectedDrills.length !== 1 ? "s" : ""} selected for your practice plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <View style={styles.drillGrid}>
                  {selectedDrills.map((drill) => (
                    <DrillCard key={drill.id} drill={drill} />
                  ))}
                </View>
              </CardContent>
            </Card>
          )}

          {problem && (
            <Card style={styles.cardMargin}>
              <CardHeader>
                <CardTitle>Issue to Address</CardTitle>
              </CardHeader>
              <CardContent>
                <Text>{problem}</Text>
              </CardContent>
            </Card>
          )}

          <View style={styles.buttonRow}>
            {!problem && (
              <Button variant="outline" onPress={goToDrillLibrary} style={styles.outlineButton}>
                <Text style={styles.outlineText}>Select Different Drills</Text>
              </Button>
            )}
            {problem && (
              <Button variant="outline" onPress={() => navigate("/ai-analysis")} style={styles.outlineButton}>
                <Text style={styles.outlineText}>Back to Analysis</Text>
              </Button>
            )}
            <Button
              onPress={generatePracticeIssue}
              disabled={isGenerating}
              style={styles.generateButton}
            >
              <Text style={styles.generateText}>
                {isGenerating ? "Generating Plan..." : "Generate Practice Plan"}
              </Text>
            </Button>
          </View>

          <PlanDurationDialog
            isOpen={showDurationDialog}
            onClose={() => setShowDurationDialog(false)}
            planDuration={planDuration}
            onPlanDurationChange={setPlanDuration}
            onConfirm={handleConfirmDuration}
          />
        </>
      )}
    </ScrollView>
  );
};

export default PracticePlanGenerator;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  focusArea: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginTop: 8,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  outlineButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  outlineText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
  generateButton: {
    backgroundColor: "#10B981", // emerald-500 to teal-600 gradient not directly possible
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  generateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cardMargin: {
    marginBottom: 16,
  },
  drillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
