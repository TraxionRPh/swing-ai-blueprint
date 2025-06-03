import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";

interface PlanDurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planDuration: string;
  onPlanDurationChange: (duration: string) => void;
  onConfirm: () => void;
}

export const PlanDurationDialog = ({
  isOpen,
  onClose,
  planDuration,
  onPlanDurationChange,
  onConfirm,
}: PlanDurationDialogProps) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Practice Duration</Text>
          <Text style={styles.description}>
            Select how many days you’d like your practice plan to cover
          </Text>
        </View>

        {/* Radio Options */}
        <View style={styles.optionsWrapper}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => onPlanDurationChange("1")}
          >
            <View
              style={[
                styles.radioCircle,
                planDuration === "1" && styles.radioCircleSelected,
              ]}
            />
            <Text style={styles.optionLabel}>1 Day Practice Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => onPlanDurationChange("3")}
          >
            <View
              style={[
                styles.radioCircle,
                planDuration === "3" && styles.radioCircleSelected,
              ]}
            />
            <Text style={styles.optionLabel}>3 Day Practice Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => onPlanDurationChange("5")}
          >
            <View
              style={[
                styles.radioCircle,
                planDuration === "5" && styles.radioCircleSelected,
              ]}
            />
            <Text style={styles.optionLabel}>5 Day Practice Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.confirmButtonText}>Create Practice Plan</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#555",
  },
  optionsWrapper: {
    marginVertical: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#777",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  optionLabel: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
