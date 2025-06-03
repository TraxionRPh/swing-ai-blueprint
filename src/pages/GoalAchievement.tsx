// GoalAchievement.native.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigate, useLocation } from "react-router-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Button } from "@/components/ui/Button";
import { Trophy, PartyPopper } from "lucide-react-native";
import { useProfile } from "@/hooks/useProfile";

interface LocationState {
  goalType?: string;
  goalValue?: string;
  actualValue?: string;
}

export const GoalAchievement: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const { saveProfile } = useProfile();

  const goalType = location.state?.goalType;
  const goalValue = location.state?.goalValue;
  const actualValue = location.state?.actualValue;

  // Stop confetti after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // If no goal data, redirect to rounds
  useEffect(() => {
    if (!goalType || !goalValue) {
      navigate("/rounds", { replace: true });
    }
  }, [goalType, goalValue, navigate]);

  const handleSetNewGoal = () => {
    navigate("/profile");
  };

  const handleContinue = () => {
    navigate("/rounds");
  };

  if (!goalType || !goalValue) {
    return null;
  }

  const { width, height } = Dimensions.get("window");

  return (
    <SafeAreaView style={styles.screenContainer}>
      {showConfetti && (
        <ConfettiCannon
          count={300}
          origin={{ x: width / 2, y: -20 }}
          fadeOut
          explosionSpeed={350}
          fallSpeed={3500}
        />
      )}

      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <View style={styles.trophyCircle}>
            <Trophy size={64} color="#FACC15" />
          </View>
        </View>

        <Text style={styles.congratsTitle}>Congratulations!</Text>

        <View style={styles.achievementRow}>
          <PartyPopper size={20} color="#FACC15" />
          <Text style={styles.achievementText}>Goal Achieved!</Text>
          <PartyPopper size={20} color="#FACC15" />
        </View>

        <Text style={styles.messageText}>
          You've reached your {goalType} goal of {goalValue}!
          {actualValue && actualValue !== goalValue && (
            <Text> Your actual score was {actualValue}.</Text>
          )}
        </Text>

        <Text style={styles.subMessage}>
          This is a great milestone in your golf journey. Would you like to set
          a new goal to keep improving?
        </Text>

        <View style={styles.buttonRow}>
          <Button variant="outline" style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonLabel}>Continue</Text>
          </Button>
          <Button style={styles.button} onPress={handleSetNewGoal}>
            <Text style={styles.buttonLabel}>Set New Goal</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GoalAchievement;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
    maxWidth: 360,
  },
  iconContainer: {
    marginBottom: 24,
  },
  trophyCircle: {
    backgroundColor: "#3B82F620", // primary/10
    padding: 16,
    borderRadius: 48,
  },
  congratsTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 16,
    textAlign: "center",
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  achievementText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginHorizontal: 8,
  },
  messageText: {
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  subMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "column",
    width: "100%",
  },
  button: {
    marginVertical: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
