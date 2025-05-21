
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/round-tracking";
import { useRound } from "@/context/round";
import { useCourseSelection } from "@/hooks/round-tracking/useCourseSelection";
import { SearchBar } from "./SearchBar";
import { CourseList } from "./CourseList";
import { TeeDialog } from "./TeeDialog";

const CourseSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Add useRound hook for context integration - using different variable names to avoid conflicts
  const { 
    setSelectedCourse: setContextSelectedCourse, 
    setSelectedTeeId: setContextSelectedTeeId, 
    setHoleCount: setContextHoleCount, 
    createRound 
  } = useRound();
  
  const { 
    filteredCourses, 
    searchQuery, 
    setSearchQuery, 
    isLoading, 
    hasError,
    refreshCourses 
  } = useCourseSelection();

  // Local state
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [selectedHoleCount, setSelectedHoleCount] = useState<number>(18);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showTeeDialog, setShowTeeDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // Handle course card click
  const handleCourseClick = (courseId: string, course: Course) => {
    if (expandedCourseId === courseId) {
      // If already expanded, collapse it
      setExpandedCourseId(null);
      setSelectedCourse(null);
      setSelectedTeeId(null);
    } else {
      // Expand this course
      setExpandedCourseId(courseId);
      setSelectedCourse(course);
      
      // Auto-select first tee if available
      if (course.course_tees && course.course_tees.length > 0) {
        setSelectedTeeId(course.course_tees[0].id);
      } else {
        setSelectedTeeId(null);
      }
    }
  };
  
  // Handle adding a new tee
  const handleAddTee = (course: Course) => {
    setCurrentCourse(course);
    setShowTeeDialog(true);
  };
  
  // Handle tee submission
  const handleTeeSubmit = async (teeData: any) => {
    if (!currentCourse) return;
    
    try {
      // Add loading state or toast notification here if desired
      
      // Insert new tee into database
      const { data: newTee, error } = await supabase
        .from("course_tees")
        .insert({
          course_id: currentCourse.id,
          name: teeData[0].name,
          color: teeData[0].color,
          course_rating: teeData[0].courseRating || null,
          slope_rating: teeData[0].slopeRating || null,
          total_yards: teeData[0].totalYards || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Tee added successfully",
        description: `${newTee.name} tee has been added to ${currentCourse.name}`,
      });
      
      // Refresh courses to get updated data
      refreshCourses();
      
      // Close the dialog
      setShowTeeDialog(false);
    } catch (error) {
      console.error("Error adding tee:", error);
      toast({
        title: "Failed to add tee",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  // Start a new round - UPDATED with better error handling and navigation
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

  // Handle hole count change
  const handleHoleCountChange = (count: number) => {
    setSelectedHoleCount(count);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Selection</h1>
          <p className="text-muted-foreground">Select a course to track your round</p>
        </div>
      </div>
      
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
        onHoleCountChange={handleHoleCountChange}
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
