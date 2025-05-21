
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types/round-tracking";
import { useRound } from "@/context/round";
import { useCourseSelection } from "@/hooks/round-tracking/useCourseSelection";
import { useCourseSelectionState } from "@/hooks/round-tracking/useCourseSelectionState";
import { CourseSelectionHeader } from "./CourseSelectionHeader";
import { SearchBar } from "./SearchBar";
import { CourseList } from "./CourseList";
import { TeeDialog } from "./TeeDialog";

const CourseSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use context from Round provider
  const { 
    setSelectedCourse: setContextSelectedCourse, 
    setSelectedTeeId: setContextSelectedTeeId, 
    setHoleCount: setContextHoleCount, 
    createRound 
  } = useRound();
  
  // Use course selection data and state hooks
  const { 
    filteredCourses, 
    searchQuery, 
    setSearchQuery, 
    isLoading, 
    hasError,
    refreshCourses 
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
    setSelectedHoleCount
  } = useCourseSelectionState();
  
  // Handle starting a round
  const handleStartRound = async () => {
    setProcessingError(null);
    
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to track rounds",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedCourse) {
      toast({
        title: "Select a course",
        description: "Please select a course to continue",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTeeId) {
      toast({
        title: "Select a tee",
        description: "Please select a tee to continue",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      console.log(`Starting round with course: ${selectedCourse.name}, tee: ${selectedTeeId}, holes: ${selectedHoleCount}`);
      
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
      setProcessingError((error as Error).message || "Failed to create round");
      toast({
        title: "Failed to start round",
        description: "Please try again. " + ((error as Error).message || ""),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <CourseSelectionHeader />
      
      {/* Search Bar */}
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
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
        onTeeSubmit={handleTeeSubmit}
      />
    </div>
  );
};

export default CourseSelection;
