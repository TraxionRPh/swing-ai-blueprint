// src/components/DrillDetailsDialog.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon"; // if desired, else remove
import { Badge } from "@/components/ui/Badge"; // RN-compatible Badge
import { PracticeTracker } from "@/components/drill-library/PracticeTracker";
import { Drill } from "@/types/drill";
import { X } from "lucide-react-native";
import { WebView } from "react-native-webview";

interface DrillDetailsDialogProps {
  drill: Drill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DrillDetailsDialog = ({
  drill,
  isOpen,
  onClose,
}: DrillDetailsDialogProps) => {
  if (!drill) return null;

  const { width } = Dimensions.get("window");

  const instructions = [
    drill.instruction1,
    drill.instruction2,
    drill.instruction3,
  ].filter(Boolean) as string[];

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose}>
              <X className="h-6 w-6 text-muted-foreground" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.contentContainer}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{drill.title}</Text>
              <Text style={styles.subText}>{drill.duration}</Text>
              <Badge
                className={`
                  ${
                    drill.difficulty === "Beginner"
                      ? "bg-emerald-500 text-white"
                      : drill.difficulty === "Intermediate"
                      ? "bg-amber-500 text-white"
                      : "bg-rose-500 text-white"
                  } px-2 py-1 rounded-md
                `}
              >
                {drill.difficulty}
              </Badge>
            </View>

            {/* Practice Tracker */}
            <View style={styles.section}>
              <PracticeTracker drill={drill} />
            </View>

            {/* Overview */}
            <View style={styles.section}>
              <Text style={styles.overviewText}>{drill.overview}</Text>
            </View>

            {/* Instructions */}
            {instructions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Instructions</Text>
                {instructions.map((instr, idx) => (
                  <View key={idx} style={styles.instructionRow}>
                    <View style={styles.bullet}>
                      <Text style={styles.bulletText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instr}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Pro Tip */}
            {drill.pro_tip && (
              <View style={styles.section}>
                <View style={styles.proTipContainer}>
                  <Text style={styles.sectionHeader}>Pro Tip</Text>
                  <Text style={styles.proTipText}>{drill.pro_tip}</Text>
                </View>
              </View>
            )}

            {/* Video Tutorial */}
            {drill.video_url && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Video Tutorial</Text>
                <View style={styles.videoWrapper}>
                  <WebView
                    source={{ uri: drill.video_url }}
                    style={{ width: width * 0.9, height: 200 }}
                    javaScriptEnabled
                    domStorageEnabled
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  closeButtonContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  contentContainer: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: "#6b7280", // text-muted-foreground
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  overviewText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#eff6ff", // bg-primary/10
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  bulletText: {
    fontSize: 12,
    color: "#3b82f6", // text-primary
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: "#374151", // text-gray-700
  },
  proTipContainer: {
    backgroundColor: "#FEF7CD",
    borderColor: "rgba(252, 211, 77, 0.5)",
    borderWidth: 1,
    padding: 12,
    borderRadius: 6,
  },
  proTipText: {
    fontSize: 14,
    color: "#374151",
  },
  videoWrapper: {
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
  },
});
