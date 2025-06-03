import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigate } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useRound } from "@/context/round";
import { useCourseSelection } from "@/hooks/round-tracking/useCourseSelection";
import { useCourseSelectionState } from "@/hooks/round-tracking/useCourseSelectionState";
import { CourseSelectionHeader } from "./CourseSelectionHeader";
import { SearchBar } from "./SearchBar";
import { CourseList } from "./CourseList";
import { TeeDialog } from "./TeeDialog";
import { CreateCourseDialog } from "./CreateCourseDialog";
import { PlusCircle } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const CourseSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // State for the create course dialog
  const [showCreateCourseDialog, setShowCreateCourseDialog] = useState(false);

  // Use context from Round provider
  const {
    setSelectedCourse: setContextSelectedCourse,
    setSelectedTeeId: setContextSelectedTeeId,
    setHoleCount: setContextHoleCount,
    createRound,
  } = useRound();

  // Use course selection data and state hooks
  const {
    filteredCourses,
    searchQuery,
    setSearchQuery,
    isLoading,
    hasError,
    refreshCourses,
  } = useCourseSelection();

  // Component state from custom hook
  const {
    expandedCourseId,
    selectedTeeId,
    selectedHoleCount,
    selectedCourse,
    showTeeDialog,
    currentCourse,
    isProcessing,
    processingError,
    setIsProcessing,
    setProcessingError,
    handleCourseClick,
    handleAddTee,
    handleTeeSubmit,
    setShowTeeDialog,
    setSelectedTeeId,
    setSelectedHoleCount,
    fetchCourseById,
  } = useCourseSelectionState();

  // Handler for after a new tee is successfully added
  const handleTeeAdded = async (teeData: any) => {
    const newTee = await handleTeeSubmit(teeData);

    if (newTee && expandedCourseId) {
      // After successful tee addition, refresh the courses list to show the new tee
      refreshCourses();
    }

    return newTee;
  };

  // Handle starting a round
  const handleStartRound = async () => {
    setProcessingError(null);

    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to track rounds",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCourse) {
      toast({
        title: "Select a course",
        description: "Please select a course to continue",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTeeId) {
      toast({
        title: "Select a tee",
        description: "Please select a tee to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log(
        `Starting round with course: ${selectedCourse.name}, tee: ${selectedTeeId}, holes: ${selectedHoleCount}`
      );

      // Update context with selected values
      setContextSelectedCourse(selectedCourse);
      setContextSelectedTeeId(selectedTeeId);
      setContextHoleCount(selectedHoleCount);

      // Create the round using the context function
      const roundId = await createRound(selectedCourse.id, selectedTeeId);

      if (roundId) {
        console.log(`Round created with ID: ${roundId}, navigating to hole 1`);
        // Navigate to the first hole - with a slight delay to ensure all state is updated
        setTimeout(() => {
          navigate(`/rounds/track/${roundId}/1`);
        }, 100);
      } else {
        throw new Error("Failed to create round - no round ID returned");
      }
    } catch (error) {
      console.error("Error creating round:", error);
      setProcessingError(
        (error as Error).message || "Failed to create round"
      );
      toast({
        title: "Failed to start round",
        description:
          "Please try again. " + ((error as Error).message || ""),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Handle course creation completion
  const handleCourseCreated = () => {
    refreshCourses();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <CourseSelectionHeader />

      {/* Search and Add Course */}
      <View style={styles.searchAddContainer}>
        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Add Course Button */}
        <TouchableOpacity
          style={styles.addCourseButton}
          onPress={() => setShowCreateCourseDialog(true)}
          activeOpacity={0.7}
        >
          <PlusCircle size={20} color="#fff" style={styles.plusIcon} />
          <Text style={styles.addCourseButtonText}>Add New Course</Text>
        </TouchableOpacity>
      </View>

      {/* Course Cards */}
      <CourseList
        isLoading={isLoading}
        hasError={hasError}
        filteredCourses={filteredCourses}
        searchQuery={searchQuery}
        expandedCourseId={expandedCourseId}
        selectedTeeId={selectedTeeId}
        selectedHoleCount={selectedHoleCount}
        isProcessing={isProcessing}
        processingError={processingError}
        onCourseClick={handleCourseClick}
        onTeeSelect={setSelectedTeeId}
        onAddTee={handleAddTee}
        onHoleCountChange={setSelectedHoleCount}
        onStartRound={handleStartRound}
        onRefreshCourses={refreshCourses}
        onClearSearch={handleClearSearch}
      />

      {/* Add Tee Dialog */}
      <TeeDialog
        currentCourse={currentCourse}
        showDialog={showTeeDialog}
        onOpenChange={setShowTeeDialog}
        onTeeSubmit={handleTeeAdded}
      />

      {/* Create Course Dialog */}
      <CreateCourseDialog
        open={showCreateCourseDialog}
        onOpenChange={setShowCreateCourseDialog}
        onCourseCreated={handleCourseCreated}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
  },
  searchAddContainer: {
    marginBottom: 24,
  },
  addCourseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  plusIcon: {
    marginRight: 8,
  },
  addCourseButtonText: {
    color: "#fff",
    fontSize:  sixteen,
    fontWeight: "500",
  },
});
