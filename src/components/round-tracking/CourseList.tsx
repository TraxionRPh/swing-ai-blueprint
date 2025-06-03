import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Course } from "@/types/round-tracking";
import { CourseCard } from "./CourseCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CourseListProps {
  isLoading: boolean;
  hasError: boolean;
  filteredCourses: Course[];
  searchQuery: string;
  expandedCourseId: string | null;
  selectedTeeId: string | null;
  selectedHoleCount: number;
  isProcessing: boolean;
  processingError: string | null;
  onCourseClick: (courseId: string, course: Course) => void;
  onTeeSelect: (teeId: string) => void;
  onAddTee: (course: Course) => void;
  onHoleCountChange: (count: number) => void;
  onStartRound: () => void;
  onRefreshCourses: () => void;
  onClearSearch: () => void;
}

export const CourseList = ({
  isLoading,
  hasError,
  filteredCourses,
  searchQuery,
  expandedCourseId,
  selectedTeeId,
  selectedHoleCount,
  isProcessing,
  processingError,
  onCourseClick,
  onTeeSelect,
  onAddTee,
  onHoleCountChange,
  onStartRound,
  onRefreshCourses,
  onClearSearch,
}: CourseListProps) => {
  const renderSkeleton = () => {
    // Render a simple gray block as skeleton
    return (
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonLineWide} />
        <View style={styles.skeletonLineMedium} />
        <View style={styles.skeletonLineSmall} />
      </View>
    );
  };

  if (isLoading) {
    const skeletonData = Array.from({ length: 6 }, (_, i) => i.toString());
    return (
      <FlatList
        data={skeletonData}
        renderItem={() => renderSkeleton()}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContainer}
      />
    );
  }

  if (hasError) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            Could not load courses. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefreshCourses}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (filteredCourses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            {searchQuery
              ? "No courses match your search"
              : "No courses available"}
          </Text>
          {searchQuery && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClearSearch}
            >
              <Text style={styles.clearButtonText}>Clear search</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredCourses}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CourseCard
          course={item}
          isExpanded={expandedCourseId === item.id}
          selectedTeeId={selectedTeeId}
          selectedHoleCount={selectedHoleCount}
          isProcessing={isProcessing}
          processingError={processingError}
          onCourseClick={onCourseClick}
          onTeeSelect={onTeeSelect}
          onAddTee={onAddTee}
          onHoleCountChange={onHoleCountChange}
          onStartRound={onStartRound}
        />
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    width: SCREEN_WIDTH - 32,
  },
  messageText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  clearButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  clearButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  skeletonCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    // Android elevation
    elevation: 1,
  },
  skeletonLineWide: {
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    width: "75%",
    marginBottom: 8,
  },
  skeletonLineMedium: {
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    width: "50%",
    marginBottom: 6,
  },
  skeletonLineSmall: {
    height: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    width: "33%",
  },
});
