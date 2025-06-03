import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ChevronRight } from "lucide-react-native";

interface HoleFooterActionsProps {
  isSaving: boolean;
  currentHole: number;
  holeCount: number;
  hasScore: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const HoleFooterActions: React.FC<HoleFooterActionsProps> = ({
  isSaving,
  currentHole,
  holeCount,
  hasScore,
  onCancel,
  onSave,
}) => {
  const showCancelText = currentHole === 1 ? "Cancel Round" : "Previous Hole";
  const isLastHole = currentHole === holeCount;

  return (
    <View style={styles.footerContainer}>
      {/* Left button: Cancel Round / Previous Hole */}
      <TouchableOpacity
        style={[styles.button, styles.outlineButton]}
        onPress={onCancel}
        disabled={isSaving}
      >
        <Text style={[styles.buttonText, styles.outlineButtonText]}>
          {showCancelText}
        </Text>
      </TouchableOpacity>

      {/* Right button: Next / Review or Loading */}
      <TouchableOpacity
        style={[
          styles.button,
          !hasScore || isSaving ? styles.disabledButton : styles.solidButton,
        ]}
        onPress={onSave}
        disabled={isSaving || !hasScore}
      >
        {isSaving ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Saving...</Text>
          </View>
        ) : isLastHole ? (
          <Text style={[styles.buttonText, styles.buttonTextWhite]}>
            Review Round
          </Text>
        ) : (
          <View style={styles.nextRow}>
            <Text style={[styles.buttonText, styles.buttonTextWhite]}>
              Next
            </Text>
            <ChevronRight size={16} style={styles.chevronIcon} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 8,
  },
  button: {
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#3182CE",
    backgroundColor: "transparent",
  },
  outlineButtonText: {
    color: "#3182CE",
  },
  solidButton: {
    backgroundColor: "#3182CE",
  },
  disabledButton: {
    backgroundColor: "#CBD5E0",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonTextWhite: {
    color: "#FFFFFF",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
  },
  nextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevronIcon: {
    marginLeft: 4,
    color: "#FFFFFF",
  },
});
