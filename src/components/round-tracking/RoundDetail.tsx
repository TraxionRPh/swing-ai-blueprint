import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigate, useParams } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useRoundLimit } from "@/hooks/useRoundLimit";
import { useRound } from "@/context/round";
import { HoleDetailsTable } from "./review/HoleDetailsTable";
import { RoundSummaryCard } from "./review/RoundSummaryCard";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";
import { useRoundReviewData } from "@/hooks/round-tracking/useRoundReviewData";
import { AlertCircle, Lock } from "lucide-react-native";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const RoundDetail = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const { roundId = "" } = useParams<{ roundId: string }>();
  const { toast } = useToast();
  const { isPremium } = useProfile();
  const { canTrackRound, daysUntilNextRound, isLoading: isCheckingLimit } =
    useRoundLimit();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const { isLoading, holeScores, roundStats } = useRoundReviewData(roundId);

  const {
    currentRoundId,
    setCurrentRoundId,
    selectedCourse,
    hasFetchError,
    setIsLoading: setRoundLoading,
  } = useRound();

  useEffect(() => {
    if (roundId && roundId !== currentRoundId) {
      setCurrentRoundId(roundId);
    }
  }, [roundId, currentRoundId, setCurrentRoundId]);

  const handleContinueRound = () => {
    if (!roundId) {
      toast({
        title: "Error",
        description: "Round ID is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }
    if (!isPremium && !canTrackRound) {
      setShowUpgradePrompt(true);
      return;
    }
    navigate(`/rounds/track/${roundId}/1`);
  };

  const handleRetryLoading = () => {
    if (roundId) {
      setRoundLoading(true);
      navigate(".", { replace: true }); // reload current screen
    }
  };

  if (isLoading || isCheckingLimit) {
    return (
      <ScrollView contentContainerStyle={styles.loadingContainer}>
        <RoundHeader
          title={selectedCourse?.name || "Round Details"}
          subtitle="Loading round details..."
          onBack={onBack}
        />
        <Loading message="Loading round details..." size="md" />
      </ScrollView>
    );
  }

  if (hasFetchError) {
    return (
      <ScrollView contentContainerStyle={styles.errorContainer}>
        <RoundHeader
          title="Round Details"
          subtitle="Connection Error"
          onBack={onBack}
        />
        <View style={styles.errorCard}>
          <View style={styles.errorHeader}>
            <AlertCircle size={24} color="#DC2626" />
            <Text style={styles.errorTitle}>Unable to load round data</Text>
          </View>
          <Text style={styles.errorText}>
            There was a problem connecting to the server. Check your internet
            connection and try again.
          </Text>
          <Button onPress={handleRetryLoading} label="Retry Loading" />
        </View>
      </ScrollView>
    );
  }

  if (showUpgradePrompt) {
    return (
      <ScrollView contentContainerStyle={styles.promptContainer}>
        <RoundHeader
          title={roundStats.courseName || "Round Details"}
          subtitle={`${roundStats.date} - ${roundStats.totalScore} strokes (${roundStats.totalHoles} holes)`}
          onBack={onBack}
        />
        <View style={styles.promptCard}>
          <View style={styles.promptHeader}>
            <Lock size={24} color="#3B82F6" />
            <Text style={styles.promptTitle}>Free Account Limit Reached</Text>
          </View>
          <Text style={styles.promptText}>
            Free accounts are limited to one round every 7 days. You can
            continue tracking this round in {daysUntilNextRound} days or upgrade
            to premium for unlimited round tracking.
          </Text>
          <View style={styles.promptButtons}>
            <Button
              onPress={() => setShowUpgradePrompt(false)}
              variant="outline"
              label="Back to Details"
            />
            <Button
              onPress={() => navigate("/subscription")}
              label="Upgrade to Premium"
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <RoundHeader
        title={roundStats.courseName || "Round Details"}
        subtitle={`${roundStats.date} - ${roundStats.totalScore} strokes (${roundStats.totalHoles} holes)`}
        onBack={onBack}
      />

      <RoundSummaryCard {...roundStats} />

      <HoleDetailsTable holeScores={holeScores} />

      <View style={styles.backButtonContainer}>
        <Button
          onPress={onBack}
          variant="outline"
          label="Back to Round History"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  loadingContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  errorContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: SCREEN_WIDTH - 32,
    alignItems: "center",
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  promptContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  promptCard: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: SCREEN_WIDTH - 32,
  },
  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 8,
  },
  promptText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  promptButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButtonContainer: {
    marginTop: 24,
    alignItems: "center",
  },
});
