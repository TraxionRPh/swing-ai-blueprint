// ChallengeHistory.native.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useParams, useNavigate } from "react-router-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ArrowLeft, Calendar } from "lucide-react-native";
import { Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { format } from "date-fns";

type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  metrics: string[];
};

type ChallengeResult = {
  id: string;
  challenge_id: string;
  best_score: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  _recent_score?: string;
};

export const ChallengeHistory: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();

  // Fetch challenge details
  const {
    data: challenge,
    isLoading: isLoadingChallenge,
  } = useQuery<Challenge | null>({
    queryKey: ["challenge", challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .single();
      if (error) {
        console.error("Error fetching challenge:", error);
        return null;
      }
      return data as Challenge;
    },
  });

  // Fetch challenge progress
  const {
    data: progress,
    isLoading: isLoadingProgress,
  } = useQuery<ChallengeResult | null>({
    queryKey: ["challenge-progress", challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      const { data, error } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("challenge_id", challengeId)
        .single();
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching challenge progress:", error);
      }
      if (data) {
        const result: ChallengeResult = {
          ...data,
          _recent_score: data.best_score,
        };
        return result;
      }
      return null;
    },
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartChallenge = () => {
    navigate(`/challenge-tracking/${challengeId}`);
  };

  if (isLoadingChallenge || isLoadingProgress) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading challenge history..." />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.notFoundTitle}>Challenge not found</Text>
        <Text style={styles.notFoundSubtitle}>
          The challenge you're looking for couldn't be found.
        </Text>
        <Button style={styles.backButton} onPress={handleBack}>
          <Text style={styles.buttonText}>Back to Challenges</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.pageTitle}>Challenge History</Text>
          <Text style={styles.pageSubtitle}>
            View your past results for this challenge
          </Text>
        </View>
      </View>

      <Card style={styles.card}>
        <CardHeader>
          <View style={styles.cardHeaderRow}>
            <CardTitle>{challenge.title}</CardTitle>
            <Badge
              variant={
                challenge.difficulty === "Beginner"
                  ? "outline"
                  : challenge.difficulty === "Intermediate"
                  ? "secondary"
                  : "default"
              }
            >
              {challenge.difficulty}
            </Badge>
          </View>
          <CardDescription style={styles.cardDescription}>
            {challenge.description}
          </CardDescription>
        </CardHeader>
        <CardContent style={styles.cardContent}>
          <View style={styles.metricsRow}>
            {challenge.metrics?.map((metric) => (
              <Badge key={metric} variant="secondary" style={styles.metricBadge}>
                {metric}
              </Badge>
            ))}
          </View>

          {progress ? (
            <View style={styles.resultsContainer}>
              <View style={styles.resultsBox}>
                <Text style={styles.resultsTitle}>Your Results</Text>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Best Score:</Text>
                  <Badge variant="default">{progress.best_score}</Badge>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Recent Score:</Text>
                  <Badge variant="outline">
                    {progress._recent_score || progress.best_score}
                  </Badge>
                </View>
                <View style={styles.resultRowSmall}>
                  <View style={styles.dateRow}>
                    <Calendar size={16} color="#6B7280" style={styles.calendarIcon} />
                    <Text style={styles.dateLabel}>Last Updated:</Text>
                  </View>
                  <Text style={styles.dateValue}>
                    {format(new Date(progress.updated_at), "MMM d, yyyy")}
                  </Text>
                </View>
              </View>
              <Button style={styles.fullWidthButton} onPress={handleStartChallenge}>
                <Text style={styles.buttonText}>Start Challenge Again</Text>
              </Button>
            </View>
          ) : (
            <View style={styles.noAttemptsContainer}>
              <Text style={styles.noAttemptsTitle}>No attempts yet</Text>
              <Text style={styles.noAttemptsSubtitle}>
                You haven't attempted this challenge yet. Start now to track your progress!
              </Text>
              <Button onPress={handleStartChallenge} style={styles.startButton}>
                <Text style={styles.buttonText}>Start Challenge</Text>
              </Button>
            </View>
          )}
        </CardContent>
      </Card>
    </ScrollView>
  );
};

export default ChallengeHistory;

const { width: windowWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContainer: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  notFoundSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButton: {
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  card: {
    width: windowWidth * 0.94,
    alignSelf: "center",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardDescription: {
    marginTop: 8,
  },
  cardContent: {
    paddingTop: 12,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  metricBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultsBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  resultRowSmall: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    marginRight: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  dateValue: {
    fontSize: 14,
    color: "#111827",
  },
  fullWidthButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  noAttemptsContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  noAttemptsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  noAttemptsSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
});
