import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Course } from "@/types/round-tracking";
import { TeeSelection } from "./TeeSelection";
import { HoleCountSelection } from "./HoleCountSelection";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CourseDetailsProps {
  selectedCourse: Course | null;
  selectedTeeId: string | null;
  setSelectedTeeId: (teeId: string) => void;
  holeCount: number;
  setHoleCount: (count: number) => void;
  onStartRound: () => void;
  isProcessing?: boolean;
}

export const CourseDetails = ({
  selectedCourse,
  selectedTeeId,
  setSelectedTeeId,
  holeCount,
  setHoleCount,
  onStartRound,
  isProcessing = false,
}: CourseDetailsProps) => {
  if (!selectedCourse) return null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Course Details</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Course Name and Location */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{selectedCourse.name}</Text>
          <Text style={styles.courseLocation}>
            {selectedCourse.city}, {selectedCourse.state}
          </Text>
        </View>

        {/* Tee Selection */}
        <TeeSelection
          selectedCourse={selectedCourse}
          selectedTeeId={selectedTeeId}
          onTeeSelect={setSelectedTeeId}
        />

        {/* Hole Count Selection */}
        <HoleCountSelection holeCount={holeCount} setHoleCount={setHoleCount} />

        {/* Start Round Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.startButton,
              (!selectedTeeId || isProcessing) && styles.buttonDisabled,
            ]}
            onPress={onStartRound}
            disabled={!selectedTeeId || isProcessing}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingText}>Creating round...</Text>
              </View>
            ) : (
              <Text style={styles.startButtonText}>Start Round</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 12,
    alignSelf: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  courseInfo: {
    marginBottom: 16,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  courseLocation: {
    fontSize:  fourteen,
    color: "#666",
    marginTop: 4,
  },
  buttonContainer: {
    marginTop:  twenty,
    alignItems: "center",
  },
  startButton: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize:  sixteen,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize:  sixteen,
    marginLeft: 8,
  },
});
