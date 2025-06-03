// DrillLibrary.native.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AISearchBar } from "@/components/drill-library/AISearchBar";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";
import { Alert } from "@/components/ui/Alert";
import { Drill } from "@/types/drill";
import { RecommendedDrillsSection } from "@/components/drill-library/RecommendedDrillsSection";
import { AllDrillsSection } from "@/components/drill-library/AllDrillsSection";
import { useAPIUsageCheck } from "@/hooks/useAPIUsageCheck";
import { useAuth } from "@/context/AuthContext";

export const DrillLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedDrills, setRecommendedDrills] = useState<Drill[]>([]);
  const [searchAnalysis, setSearchAnalysis] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { toast } = useToast();
  const { checkAPIUsage } = useAPIUsageCheck();
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const { data: drills, isLoading } = useQuery<Drill[]>({
    queryKey: ["drills"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("drills").select("*");
        if (error) throw error;
        return data as Drill[];
      } catch (error) {
        console.error("Error fetching drills:", error);
        toast({
          title: "Error loading drills",
          description: "Unable to load the drill library. Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const filterDrills = useCallback(
    (drillsToFilter: Drill[] = []) => {
      return drillsToFilter.filter((drill) => {
        const matchesSearch =
          !searchQuery ||
          drill.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          drill.overview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(drill.focus) &&
            drill.focus.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            ));

        const matchesCategory =
          selectedCategory === "all" || drill.category === selectedCategory;

        const matchesDifficulty =
          !selectedDifficulty || drill.difficulty === selectedDifficulty;

        return matchesSearch && matchesCategory && matchesDifficulty;
      });
    },
    [searchQuery, selectedCategory, selectedDifficulty]
  );

  const filteredDrills = useMemo(() => {
    return filterDrills(drills || []);
  }, [drills, filterDrills]);

  const handleAISearch = useCallback(
    async (query: string) => {
      setIsAnalyzing(true);
      setSearchQuery(query);
      setSearchError(null);
      setRecommendedDrills([]);
      setSearchAnalysis("");

      try {
        const canProceed = await checkAPIUsage(user?.id, "ai_analysis");
        if (!canProceed) {
          setIsAnalyzing(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke("search-drills", {
          body: { query },
        });

        if (error) {
          console.error("Search function error:", error);
          throw new Error(error.message || "Failed to search drills");
        }

        if (!data) {
          throw new Error("Received empty response from search function");
        }

        if (data.error) {
          console.error("Server reported error:", data.error);
          throw new Error(data.error);
        }

        if (data.drills && Array.isArray(data.drills)) {
          setRecommendedDrills(data.drills);
          setSearchAnalysis(data.analysis || "");

          if (data.drills.length > 0) {
            toast({
              title: `${data.drills.length} Drills Found`,
              description: "We've found the perfect drills to help with your issue.",
            });

            // Scroll to recommendations
            setTimeout(() => {
              scrollRef.current?.scrollTo({
                y: recommendationsY,
                animated: true,
              });
            }, 500);
          } else {
            toast({
              title: "No matching drills found",
              description: "Try rephrasing your issue or using different terms.",
              variant: "destructive",
            });
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchError(
          error instanceof Error ? error.message : "Failed to search drills"
        );
        toast({
          title: "Search Failed",
          description:
            "Failed to find matching drills. Please try again or browse all drills below.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [checkAPIUsage, user?.id, toast]
  );

  // Measure Y offset of RecommendedDrillsSection
  const [recommendationsY, setRecommendationsY] = useState(0);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading drills...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Drill Library</Text>
        <Text style={styles.subtitle}>
          Browse our collection of golf drills or describe an issue for personalized
          recommendations
        </Text>
      </View>

      <Card style={styles.searchCard}>
        <CardContent style={styles.searchContent}>
          <AISearchBar onSearch={handleAISearch} isAnalyzing={isAnalyzing} />

          {searchError && (
            <Alert variant="destructive" style={styles.alert}>
              <Text style={styles.alertTitle}>Search Error</Text>
              <Text style={styles.alertDescription}>
                {searchError}. Please try again or browse drills below.
              </Text>
            </Alert>
          )}
        </CardContent>
      </Card>

      <View
        onLayout={(e) => {
          setRecommendationsY(e.nativeEvent.layout.y);
        }}
      >
        <RecommendedDrillsSection
          drills={recommendedDrills}
          searchAnalysis={searchAnalysis}
        />
      </View>

      <AllDrillsSection
        drills={drills || []}
        filteredDrills={filteredDrills}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
      />
    </ScrollView>
  );
};

export default DrillLibrary;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#6B7280",
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  searchCard: {
    backgroundColor: "#F3F4F6",
    marginBottom: 24,
  },
  searchContent: {
    paddingTop: 16,
  },
  alert: {
    marginTop: 16,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 6,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#991B1B",
  },
  alertDescription: {
    fontSize: 14,
    color: "#991B1B",
    marginTop: 4,
  },
});
