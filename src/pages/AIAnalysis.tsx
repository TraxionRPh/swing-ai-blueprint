// AIAnalysis.native.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";

// Assume these come from RN‐compatible files (e.g. PerformanceRadarChart.native.tsx)
import { PerformanceRadarChart } from "@/components/ai-analysis/PerformanceRadarChart";
import { ConfidenceChart } from "@/components/ai-analysis/ConfidenceChart";
import { IdentifiedIssues } from "@/components/ai-analysis/IdentifiedIssues";
import { PracticeRecommendations } from "@/components/ai-analysis/PracticeRecommendations";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Loading } from "@/components/ui/Loading";
import { AIAnalysisHeader } from "@/components/ai-analysis/AIAnalysisHeader";
import { AIAnalysisInfoBanner } from "@/components/ai-analysis/AIAnalysisInfoBanner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAIConfidence } from "@/hooks/useAIConfidence";
import type { GeneratedPracticePlan } from "@/types/practice-plan";

// If your Supabase records use snake_case in RN as well, keep “practice_plan”;
// otherwise, adjust property names to match your RN queries.

interface PerformanceInsights {
  performance?: {
    driving: number;
    ironPlay: number;
    chipping: number;
    bunker: number;
    putting: number;
  };
  isPlaceholder?: boolean;
}

export const AIAnalysis: React.FC = () => {
  const { generatePlan, isGenerating, apiUsageInfo } = useAIAnalysis();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const { aiConfidenceHistory, updateConfidence } = useAIConfidence();
  const [hasPerformanceData, setHasPerformanceData] = useState<boolean>(false);

  // Fetch current user ID and their latest AI practice plan from Supabase
  useEffect(() => {
    const fetchUserAndPlan = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error("Error fetching user:", authError);
          return;
        }
        const user = authData?.user;
        if (user?.id) {
          setUserId(user.id);

          const { data: planData, error: planError } = await supabase
            .from("ai_practice_plans")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (planError) {
            console.error("Error fetching plan:", planError);
            return;
          }
          if (planData && planData.length > 0) {
            const latestPlan = planData[0];
            setAnalysisData(latestPlan);

            // Extract performanceInsights from the JSON “practice_plan” field
            const practicePlan = latestPlan.practice_plan as any;
            if (
              practicePlan &&
              typeof practicePlan === "object" &&
              "performanceInsights" in practicePlan
            ) {
              const perfInsights = practicePlan.performanceInsights as PerformanceInsights;
              const perfData = perfInsights?.performance;
              const isPlaceholder = perfInsights?.isPlaceholder;
              setHasPerformanceData(!!perfData && !isPlaceholder);
            } else {
              setHasPerformanceData(false);
            }
          }
        }
      } catch (err) {
        console.error("Error in fetchUserAndPlan:", err);
      }
    };

    fetchUserAndPlan();
  }, []);

  const handleRefreshAnalysis = () => {
    if (!userId) {
      toast({
        title: "No user ID",
        description: "Cannot generate plan without a valid user ID.",
        status: "error",
      });
      return;
    }

    generatePlan(userId, "", "beginner", "1")
      .then((data: GeneratedPracticePlan) => {
        if (data) {
          setAnalysisData(data);

          // The GeneratedPracticePlan type uses “practicePlan” instead of “practice_plan”
          const practicePlanData = (data as any).practicePlan as any;
          if (
            practicePlanData &&
            typeof practicePlanData === "object" &&
            "performanceInsights" in practicePlanData
          ) {
            const perfInsights = practicePlanData.performanceInsights as PerformanceInsights;
            const perfData = perfInsights?.performance;
            const isPlaceholder = perfInsights?.isPlaceholder;
            setHasPerformanceData(!!perfData && !isPlaceholder);
          } else {
            setHasPerformanceData(false);
          }
        }
      })
      .catch((error) => {
        console.error("Error refreshing analysis:", error);
        toast({
          title: "Refresh Error",
          description: "There was an error generating a new plan.",
          status: "error",
        });
      });
  };

  // Compute the most recent confidence value or default to 35
  const currentConfidence =
    aiConfidenceHistory.length > 0
      ? aiConfidenceHistory[aiConfidenceHistory.length - 1].confidence
      : 35;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Header + Info Banner */}
      <AIAnalysisHeader
        isGenerating={isGenerating}
        onRefresh={handleRefreshAnalysis}
        apiUsageInfo={apiUsageInfo}
      />
      <AIAnalysisInfoBanner />

      {isGenerating ? (
        <View style={styles.loadingContainer}>
          <Loading message="AI is analyzing your performance data..." fixed />
        </View>
      ) : (
        <>
          {analysisData ? (
            <View style={styles.cardsContainer}>
              {/* Performance Radar Chart */}
              <View style={styles.card}>
                <PerformanceRadarChart
                  data={
                    // In the DB record this might be “practice_plan.performanceInsights.performance”
                    // or, if generatePlan returns GeneratedPracticePlan, it’s “practicePlan.performanceInsights.performance”
                    analysisData.practice_plan?.performanceInsights?.performance ||
                      (analysisData.practicePlan as any)?.performanceInsights?.performance
                  }
                  isPlaceholder={!hasPerformanceData}
                />
              </View>

              {/* Confidence Chart */}
              <View style={styles.card}>
                <ConfidenceChart
                  confidenceData={aiConfidenceHistory}
                  currentConfidence={currentConfidence}
                />
              </View>

              {/* Identified Issues */}
              <View style={styles.card}>
                <IdentifiedIssues
                  issues={
                    Array.isArray(analysisData.performanceInsights) &&
                    analysisData.performanceInsights.length > 0
                      ? analysisData.performanceInsights.map((insight: any) => ({
                          area: insight.area,
                          description: insight.description,
                          priority: insight.priority,
                        }))
                      : Array.isArray(analysisData.rootCauses)
                      ? (analysisData.rootCauses as string[]).map((cause, i) => {
                          let area: string, description: string, priority: "High" | "Medium" | "Low";
                          switch (i) {
                            case 0:
                              area = "Driving Accuracy";
                              description =
                                "Improving your accuracy off the tee will set you up for more successful approach shots and lower scores overall.";
                              priority = "High";
                              break;
                            case 1:
                              area = "Short Game";
                              description =
                                "Focus on your short game around the greens, especially chipping and bunker play. Consistent up-and-downs can significantly lower your scores.";
                              priority = "Medium";
                              break;
                            case 2:
                              area = "Iron Play";
                              description =
                                "Work on consistent distance control with your irons to improve your approach shots and increase greens in regulation.";
                              priority = "Low";
                              break;
                            case 3:
                              area = "Putting";
                              description =
                                "Enhancing your putting skills, particularly with speed control and reading greens, can eliminate unnecessary strokes from your game.";
                              priority = "Low";
                              break;
                            default:
                              area = "Course Management";
                              description =
                                "Developing better strategic decisions on the course can help you avoid trouble and play to your strengths.";
                              priority = "Low";
                          }
                          return { area, description, priority };
                        })
                      : []
                  }
                />
              </View>

              {/* Practice Recommendations */}
              <View style={styles.card}>
                <PracticeRecommendations
                  recommendations={
                    (analysisData.practice_plan?.plan?.[0] &&
                      {
                        weeklyFocus: analysisData.practice_plan.plan[0].focus || "Swing Fundamentals",
                        primaryDrill: {
                          name:
                            analysisData.practice_plan.plan[0].drills?.[0]?.drill?.title ||
                            "Alignment Drill",
                          description:
                            analysisData.practice_plan.plan[0].drills?.[0]?.drill?.overview ||
                            "Basic alignment practice",
                          frequency: `${analysisData.practice_plan.plan[0].drills?.[0]?.sets || 3}x sets, ${
                            analysisData.practice_plan.plan[0].drills?.[0]?.reps || 10
                          }x reps`,
                        },
                        secondaryDrill: {
                          name:
                            analysisData.practice_plan.plan[0].drills?.[1]?.drill?.title ||
                            "Swing Path Drill",
                          description:
                            analysisData.practice_plan.plan[0].drills?.[1]?.drill?.overview ||
                            "Practice your swing path",
                          frequency: `${analysisData.practice_plan.plan[0].drills?.[1]?.sets || 2}x sets, ${
                            analysisData.practice_plan.plan[0].drills?.[1]?.reps || 10
                          }x reps`,
                        },
                        weeklyAssignment:
                          analysisData.practice_plan.challenge?.description ||
                          "Complete a practice challenge this week",
                      }) ||
                    undefined
                  }
                />
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No analysis data yet. Tap “Update Analysis” to generate your first AI analysis.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default AIAnalysis;

// ========== Styles ==========
const { width: windowWidth } = Dimensions.get("window");

// We’ll arrange cards in a 1‐column layout on phones and 2‐column on tablets (≳ 768px width).
const isTablet = windowWidth >= 768;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF", // or your app’s background
  },
  loadingContainer: {
    minHeight: "80%", // approximate “min-h-[80vh]”
    alignItems: "center",
    justifyContent: "center",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  card: {
    width: isTablet ? "48%" : "100%",
    marginBottom: 16,
    // If you want a white card with shadow:
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 2,
  },
  emptyContainer: {
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#6B7280", // Tailwind’s text-muted‐foreground
    fontSize: 16,
    textAlign: "center",
  },
});
