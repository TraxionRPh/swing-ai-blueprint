import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { Course } from "@/types/round-tracking";

interface CourseSearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Course[];
  isSearching: boolean;
  recentCourses: Course[];
  showRecentCourses: boolean;
  onCourseSelect: (course: Course) => void;
  selectedCourseId?: string | null;
  hasSearchError?: boolean;
}

export const CourseSearchInput = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  recentCourses,
  showRecentCourses,
  onCourseSelect,
  selectedCourseId,
  hasSearchError = false,
}: CourseSearchInputProps) => {
  const handleRetry = () => {
    if (searchQuery.trim()) {
      const currentQuery = searchQuery;
      setSearchQuery(currentQuery + " ");
      setTimeout(() => setSearchQuery(currentQuery), 10);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for a course name, city, or state..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView style={styles.listContainer} nestedScrollEnabled>
        {isSearching && (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}>Searching courses...</Text>
          </View>
        )}

        {hasSearchError && (
          <View style={styles.centered}>
            <AlertTriangle size={40} color="#E55353" />
            <Text style={styles.errorTitle}>Error searching courses</Text>
            <Text style={styles.errorMessage}>
              Check your connection and try again
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Text style={styles.retryButtonText}>Retry Search</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isSearching && !hasSearchError && searchResults.length > 0 && (
          <View>
            <Text style={styles.groupHeading}>Search Results</Text>
            {searchResults.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.item,
                  selectedCourseId === course.id && styles.itemSelected,
                ]}
                onPress={() => onCourseSelect(course)}
              >
                <Text style={styles.itemTitle}>{course.name}</Text>
                <Text style={styles.itemSubtitle}>
                  {course.city}, {course.state}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isSearching &&
          !hasSearchError &&
          searchQuery === "" &&
          showRecentCourses &&
          recentCourses.length > 0 && (
            <View>
              <Text style={styles.groupHeading}>Recently Played</Text>
              {recentCourses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.item,
                    selectedCourseId === course.id && styles.itemSelected,
                  ]}
                  onPress={() => onCourseSelect(course)}
                >
                  <Text style={styles.itemTitle}>{course.name}</Text>
                  <Text style={styles.itemSubtitle}>
                    {course.city}, {course.state}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

        {!isSearching &&
          !hasSearchError &&
          searchQuery !== "" &&
          searchResults.length === 0 && (
            <Text style={styles.emptyText}>
              No courses found. Try a different search.
            </Text>
          )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize:  sixteen,
    backgroundColor: "#fff",
  },
  listContainer: {
    maxHeight: 300,
    marginTop: 8,
  },
  centered: {
    alignItems: "center",
    paddingVertical: 16,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  errorTitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#E55353",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorMessage: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  groupHeading: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
    color: "#333",
  },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  itemSelected: {
    backgroundColor: "#e6f0ff",
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  emptyText: {
    padding: 16,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
});
