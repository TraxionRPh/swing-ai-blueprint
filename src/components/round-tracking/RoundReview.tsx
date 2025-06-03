import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigate, useParams } from "react-router-native";
import { Loading } from "@/components/ui/Loading";
import { RoundSummaryCard } from "@/components/round-tracking/review/RoundSummaryCard";
import { HoleDetailsTable } from "@/components/round-tracking/review/HoleDetailsTable";
import { useRoundReviewData } from "@/hooks/round-tracking/useRoundReviewData";
import { useRoundCompletion } from "@/hooks/round-tracking/useRoundCompletion";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const RoundReview = () => {
  const navigate = useNavigate();
  const { roundId = "" } = useParams<{ roundId: string }>();

  const { isLoading, holeScores, roundStats } = useRoundReviewData(roundId);

  const { completeRound, isSaving } = useRoundCompletion(
    roundId,
    roundStats.totalScore,
    roundStats.totalHoles
  );

  const handleCompleteRound = async () => {
    await completeRound({
      totalScore: roundStats.totalScore,
      totalPutts: roundStats.totalPutts,
      fairwaysHit: roundStats.fairwaysHit,
      greensInRegulation: roundStats.greensInRegulation,
    });
    // completeRound handles navigation internally
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading size="lg" message="Loading round summary..." />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Round Review</Text>
        <Text style={styles.subtitle}>
          Review and submit your {roundStats.totalHoles}-hole round
        </Text>
      </View>

      <RoundSummaryCard {...roundStats} />

      <View style={styles.tableSection}>
        <HoleDetailsTable holeScores={holeScores} />
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.outlineButton]}
            onPress={() =>
              navigate(`/rounds/track/${roundId}/${roundStats.totalHoles}`)
            }
          >
            <Text style={[styles.footerButtonText, styles.outlineText]}>
              Back to Scoring
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.footerButton,
              (isSaving || holeScores.length === 0) && styles.disabledButton,
            ]}
            onPress={handleCompleteRound}
            disabled={isSaving || holeScores.length === 0}
          >
            {isSaving ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.footerButtonText}> Saving... </Text>
              </View>
            ) : (
              <Text style={styles.footerButtonText}>Complete Round</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  tableSection: {
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#2563EB",
  },
  outlineButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  outlineText: {
    color: "#2563EB",
  },
  disabledButton: {
    opacity: 0.6,
  },
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
  },
});
