// ChallengeTracking.native.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useParams, useNavigate } from "react-router-native";
import { useChallenge } from "@/hooks/useChallenge";
import { useSubmitChallenge } from "@/hooks/useSubmitChallenge";
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
import { TrackingForm } from "@/components/challenge/TrackingForm";

const extractAttemptsFromInstructions = (challenge: any): number => {
  if (challenge.attempts && typeof challenge.attempts === "number") {
    return challenge.attempts;
  }

  const instructions = [
    challenge.instruction1,
    challenge.instruction2,
    challenge.instruction3,
  ];

  for (const instruction of instructions) {
    if (!instruction) continue;
    const match = instruction.match(/(\d+)\s*(?:balls?|drives?|shots?|attempts?)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return 10;
};

export const ChallengeTracking: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { data: challenge, isLoading } = useChallenge(challengeId);
  const { onSubmit, isPersisting } = useSubmitChallenge(challengeId);

  const handleBack = () => {
    navigate(-1);
  };

  const totalAttempts = challenge
    ? extractAttemptsFromInstructions(challenge)
    : 10;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Loading challenge..." />
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
          <Text style={styles.pageTitle}>Challenge Tracking</Text>
          <Text style={styles.pageSubtitle}>
            Record your results for this challenge
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
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {[
              challenge.instruction1,
              challenge.instruction2,
              challenge.instruction3,
            ].map(
              (instr, idx) =>
                instr && (
                  <View key={idx} style={styles.instructionRow}>
                    <Text style={styles.instructionIndex}>{`${idx + 1}. `}</Text>
                    <Text style={styles.instructionText}>{instr}</Text>
                  </View>
                )
            )}
          </View>

          {/* Metrics */}
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitleFull}>Metrics</Text>
            <View style={styles.metricsRow}>
              {challenge.metrics?.map((metric: string) => (
                <Badge
                  key={metric}
                  variant="secondary"
                  style={styles.metricBadge}
                >
                  {metric}
                </Badge>
              ))}
            </View>
          </View>

          {/* Tracking Form */}
          <TrackingForm
            onSubmit={onSubmit}
            isPersisting={isPersisting}
            totalAttempts={totalAttempts}
          />
        </CardContent>
      </Card>
    </ScrollView>
  );
};

export default ChallengeTracking;

const { width: windowWidth } = Dimensions.get("window");

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
  instructionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionTitleFull: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    width: "100%",
  },
  instructionRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  instructionIndex: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  instructionText: {
    fontSize: 16,
    color: "#6B7280",
    flexShrink: 1,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metricBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
});
