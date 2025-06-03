// src/components/GoalAchievementModal.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { PartyPopper } from "lucide-react-native";
import { AchievedGoal } from "@/hooks/useGoalAchievement";

interface GoalAchievementModalProps {
  achievedGoal: AchievedGoal | null;
  onClose: () => void;
  onSetNewGoal: () => void;
}

const GoalAchievementModal = ({
  achievedGoal,
  onClose,
  onSetNewGoal,
}: GoalAchievementModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const { width, height } = Dimensions.get("window");

  useEffect(() => {
    if (achievedGoal) {
      setShowConfetti(true);
      toast({
        title: "Congratulations! 🎉",
        description: `You've reached your ${achievedGoal.type} goal of ${achievedGoal.value}!`,
        duration: 2000,
      });

      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievedGoal, toast]);

  if (!achievedGoal) return null;

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.overlay}>
        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: width / 2, y: 0 }}
            fadeOut
          />
        )}

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <PartyPopper className="h-6 w-6 text-yellow-500" />
            <Text style={styles.title}>Congratulations!</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            You've achieved your {achievedGoal.type} goal of {achievedGoal.value}!{`\n`}
            This is a great milestone in your golf journey.
          </Text>

          <View style={styles.promptContainer}>
            <Text style={styles.prompt}>
              Would you like to set a new goal to keep improving?
            </Text>
          </View>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Button variant="outline" onPress={onClose} className="flex-1 mr-2">
              <Text style={styles.buttonText}>Maybe Later</Text>
            </Button>
            <Button onPress={onSetNewGoal} className="flex-1 ml-2">
              <Text style={styles.buttonText}>Set New Goal</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GoalAchievementModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    lineHeight: 20,
  },
  promptContainer: {
    marginVertical: 12,
    alignItems: "center",
  },
  prompt: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
