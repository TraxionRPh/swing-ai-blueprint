import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigate } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { RoundHeader } from "./RoundHeader";
import { Course } from "@/types/round-tracking";
import { useRound } from "@/context/round";
import { useCoursesFetcher } from "@/hooks/round-tracking/useCoursesFetcher";
import { CourseCardSkeletonGrid } from "./CourseCardSkeleton";
import { PlusCircle, Search, AlertTriangle } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CoursesListingProps {
  onBack: () => void;
}

export const CoursesListing = ({ onBack }: CoursesListingProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setSelectedCourse, setSelectedTeeId } = useRound();

  const {
    filteredCourses,
    isLoading,
    hasError,
    searchQuery,
    setSearchQuery,
    fetchCourses,
    refetchCourses,
  } = useCoursesFetcher();

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);

    // Set the first tee as default if available
    if (course.course_tees?.length > 0) {
      setSelectedTeeId(course.course_tees[0].id);
    }

    navigate(`/rounds/new`);
  };

  const handleAddCourse = () => {
    // For now just show a toast - later this could navigate to a course creation form
    toast({
      title: "Add Course",
      description: "Course creation feature coming soon!",
    });
  };

  const handleViewRounds = () => {
    navigate("/rounds/list");
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      activeOpacity={0.7}
      onPress={() => handleSelectCourse(item)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.courseName}>{item.name}</Text>
        <Text style={styles.courseLocation}>
          {item.city}, {item.state}
        </Text>
        <Text style={styles.courseTees}>
          {item.course_tees && item.course_tees.length > 0
            ? `${item.course_tees.length} tee${
                item.course_tees.length > 1 ? "s" : ""
              } available`
            : "No tee information"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <RoundHeader
        title="Course Selection"
        subtitle="Select a course to start a new round"
        onBack={onBack}
      />

      {/* Search and Buttons */}
      <View style={styles.searchAddContainer}>
        <View style={styles.searchWrapper}>
          <Search
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses by name, city or state..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.outlineButton]}
            activeOpacity={0.7}
            onPress={handleAddCourse}
          >
            <PlusCircle size={20} color="#007AFF" style={styles.plusIcon} />
            <Text style={[styles.buttonText, { color: "#007AFF" }]}>
              Add Course
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            activeOpacity={0.7}
            onPress={handleViewRounds}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              View My Rounds
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading State */}
      {isLoading && <CourseCardSkeletonGrid />}

      {/* Error State */}
      {hasError && !isLoading && (
        <View style={styles.centerContainer}>
          <View style={styles.messageCard}>
            <AlertTriangle size={48} color="#E55353" />
            <Text style={styles.errorTitle}>Failed to load courses</Text>
            <Text style={styles.errorMessage}>
              There was a problem loading the course list.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.7}
              onPress={refetchCourses}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* No Results */}
      {!isLoading && !hasError && filteredCourses.length === 0 && (
        <View style={styles.centerContainer}>
          <View style={styles.messageCard}>
            <Text style={styles.noCoursesText}>
              {searchQuery.trim()
                ? "No courses match your search."
                : "No courses available."}
            </Text>
            {searchQuery.trim() && (
              <TouchableOpacity
                style={[styles.actionButton, styles.outlineButton]}
                activeOpacity={0.7}
                onPress={() => setSearchQuery("")}
              >
                <Text style={[styles.buttonText, { color: "#007AFF" }]}>
                  Clear Search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Course List */}
      {!isLoading && !hasError && filteredCourses.length > 0 && (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          numColumns={
            SCREEN_WIDTH >= 800 ? 3 : SCREEN_WIDTH >= 500 ? 2 : 1
          }
          columnWrapperStyle={
            SCREEN_WIDTH >= 500 ? styles.columnWrapper : undefined
          }
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
  },
  searchAddContainer: {
    marginBottom: 24,
  },
  searchWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  searchIcon: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  searchInput: {
    height: 44,
    paddingLeft: 40,
    paddingRight: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#fff",
    fontSize:  sixteen,
    color: "#000",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
    marginRight: 8,
  },
  plusIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize:  sixteen,
    fontWeight: "500",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
  },
  secondaryButton: {
    backgroundColor: "#007AFF",
  },
  centerContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: SCREEN_WIDTH - 32,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    color: "#333",
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
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
  noCoursesText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  listContainer: {
    paddingVertical: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 8,
    flex: 1,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  courseLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  courseTees: {
    fontSize:  fourteen,
    color: "#444",
  },
});
