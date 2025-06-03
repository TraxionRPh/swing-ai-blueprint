import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Course } from "@/types/round-tracking";
import { ChevronDown, ChevronUp, Plus } from "lucide-react-native";
import { TeeSelection } from "./TeeSelection";
import { HoleCountSelection } from "./HoleCountSelection";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CourseCardProps {
  course: Course;
  isExpanded: boolean;
  selectedTeeId: string | null;
  selectedHoleCount: number;
  isProcessing: boolean;
  processingError: string | null;
  onCourseClick: (courseId: string, course: Course) => void;
  onTeeSelect: (teeId: string) => void;
  onAddTee: (course: Course) => void;
  onHoleCountChange: (count: number) => void;
  onStartRound: () => void;
}

export const CourseCard = ({
  course,
  isExpanded,
  selectedTeeId,
  selectedHoleCount,
  isProcessing,
  processingError,
  onCourseClick,
  onTeeSelect,
  onAddTee,
  onHoleCountChange,
  onStartRound,
}: CourseCardProps) => {
  return (
    <View
      style={[
        styles.card,
        isExpanded && styles.cardExpanded,
      ]}
    >
      {/* Card Header */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => onCourseClick(course.id, course)}
      >
        <View>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.courseLocation}>
            {course.city}, {course.state}
          </Text>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color="#333" />
        ) : (
          <ChevronDown size={20} color="#333" />
        )}
      </TouchableOpacity>

      {/* Expanded Section */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          {/* Tee Selection */}
          {course.course_tees && course.course_tees.length > 0 ? (
            <TeeSelection
              selectedCourse={course}
              selectedTeeId={selectedTeeId}
              onTeeSelect={onTeeSelect}
              onAddTee={() => onAddTee(course)}
            />
          ) : (
            <View style={styles.noTeeContainer}>
              <View style={styles.noTeeTextContainer}>
                <Text style={styles.noTeeText}>
                  No tee information available
                </Text>
                <TouchableOpacity
                  style={styles.addTeeButton}
                  onPress={() => onAddTee(course)}
                >
                  <Plus size={16} color="#007AFF" />
                  <Text style={styles.addTeeButtonText}>Add Tee</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Hole Count Selection */}
          <View style={styles.holeCountContainer}>
            <HoleCountSelection
              holeCount={selectedHoleCount}
              setHoleCount={onHoleCountChange}
            />
          </View>

          {/* Start Round Button */}
          <TouchableOpacity
            style={[
              styles.startButton,
              (isProcessing || !selectedTeeId) && styles.buttonDisabled,
            ]}
            onPress={onStartRound}
            disabled={isProcessing || !selectedTeeId}
            activeOpacity={0.7}
          >
            <Text style={styles.startButtonText}>
              {isProcessing ? "Creating Round..." : "Start Round"}
            </Text>
          </TouchableOpacity>

          {/* Processing Error */}
          {processingError && (
            <Text style={styles.errorText}>{processingError}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 8,
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
  cardExpanded: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  courseLocation: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  expandedSection: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  noTeeContainer: {
    marginBottom: 16,
  },
  noTeeTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  noTeeText: {
    fontSize: 14,
    color: "#888",
  },
  addTeeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addTeeButtonText: {
    fontSize:  fourteen,
    color: "#007AFF",
    marginLeft: 4,
  },
  holeCountContainer: {
    marginTop:  sixteen,
    marginBottom:  twelve,
  },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
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
  errorText: {
    marginTop: 8,
    fontSize:  fourteen,
    color: "#E55353",
    textAlign: "center",
  },
});
