import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigate } from "react-router-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlayCircle, Trash2 } from "lucide-react-native";
import { useToast } from "@/hooks/use-toast";

interface InProgressRoundCardProps {
  roundId: string;
  courseName: string;
  lastHole: number;
  holeCount: number;
  onDelete?: () => void;
}

export const InProgressRoundCard = ({
  roundId,
  courseName,
  lastHole,
  holeCount,
  onDelete,
}: InProgressRoundCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResumeRound = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Loading round",
        description: "Retrieving your round data...",
      });

      const resumeHole =
        lastHole === 0 ? 1 : Math.min(lastHole + 1, holeCount);

      await AsyncStorage.removeItem("resume-hole-number");
      await AsyncStorage.removeItem("force-resume");

      await AsyncStorage.setItem(
        "resume-hole-number",
        resumeHole.toString()
      );
      await AsyncStorage.setItem("force-resume", "true");

      setTimeout(() => {
        navigate(`/rounds/${roundId}`);
      }, 300);
    } catch (error) {
      console.error("Navigation error:", error);
      setIsLoading(false);
      toast({
        title: "Navigation error",
        description:
          "There was an issue loading this round. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Resume Round</Text>
          <TouchableOpacity
            onPress={() => setShowDeleteDialog(true)}
            style={styles.iconButton}
          >
            <Trash2 size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.text}>
            You have an incomplete round at{" "}
            <Text style={styles.boldText}>{courseName}</Text>
          </Text>
          <Text style={styles.text}>
            Progress: {lastHole} of {holeCount} holes completed
          </Text>

          <TouchableOpacity
            onPress={handleResumeRound}
            style={[styles.resumeButton, isLoading && styles.disabledButton]}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={styles.spinner}
                />
                <Text style={styles.buttonText}>Loading Round...</Text>
              </>
            ) : (
              <>
                <PlayCircle size={20} color="#fff" style={styles.icon} />
                <Text style={styles.buttonText}>Continue Round</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={showDeleteDialog}
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Round</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to delete this round? This action cannot be
              undone.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowDeleteDialog(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onDelete?.();
                  setShowDeleteDialog(false);
                }}
                style={[styles.modalButton, styles.deleteButton]}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  iconButton: {
    padding: 4,
  },
  content: {
    flexDirection: "column",
    gap: 8,
  },
  text: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  boldText: {
    fontWeight: "600",
    color: "#111827",
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  icon: {
    marginRight: 4,
  },
  spinner: {
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  modalDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#dc2626",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
