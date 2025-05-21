
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useRound } from "@/context/round"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoundHeader } from "./RoundHeader";
import { CourseSearchInput } from "./CourseSearchInput";
import { CourseDetails } from "./CourseDetails";
import { useCourseSearch } from "@/hooks/round-tracking/useCourseSearch";
import { Course } from "@/types/round-tracking";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CourseCreationProps {
  onBack: () => void;
  holeCount?: number;
}

export const RoundCreation = ({ onBack, holeCount = 18 }: CourseCreationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    setHoleCount, 
    selectedCourse, 
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId,
    createRound
  } = useRound();
  
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    recentCourses,
    showRecentCourses,
    fetchRecentCourses,
    hasSearchError
  } = useCourseSearch();
  
  // Set the hole count from props
  useEffect(() => {
    setHoleCount(holeCount);
  }, [holeCount, setHoleCount]);

  // Fetch recent courses on component mount
  useEffect(() => {
    if (user) {
      fetchRecentCourses(user.id);
    }
  }, [user]);

  const handleCourseSelect = (course: Course) => {
    console.log("Selected course:", course);
    setSelectedCourse(course);
    
    // Set the first tee as default if available
    if (course.course_tees?.length > 0) {
      setSelectedTeeId(course.course_tees[0].id);
    }
  };

  const handleStartRound = async () => {
    if (!selectedCourse) {
      toast({
        title: "Course Required",
        description: "Please select a course before starting your round",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Creating new round...");
    setIsProcessing(true);
    
    try {
      // Create a new round
      const roundId = await createRound(selectedCourse.id, selectedTeeId);
      
      if (roundId) {
        // Navigate to first hole
        navigate(`/rounds/${roundId}/1`);
      } else {
        throw new Error("Failed to create round");
      }
    } catch (error) {
      console.error("Error creating round:", error);
      toast({
        title: "Error Creating Round",
        description: "There was a problem creating your round. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a manual course option
  const handleAddCourseManually = () => {
    // This is where you would navigate to a course creation form
    // For now we'll just show a toast
    toast({
      title: "Manual Course Creation",
      description: "This feature is coming soon!",
    });
  };

  return (
    <div className="space-y-6">
      <RoundHeader
        title="New Round"
        subtitle="Select a course and start tracking your round"
        onBack={onBack}
      />
      
      {/* Course Search */}
      <Card>
        <CardHeader>
          <CardTitle>Find a Course</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseSearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            recentCourses={recentCourses}
            showRecentCourses={showRecentCourses}
            onCourseSelect={handleCourseSelect}
            selectedCourseId={selectedCourse?.id}
            hasSearchError={hasSearchError}
          />
          
          {/* Add a manual add option */}
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Can't find your course?
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddCourseManually}
              >
                Add Course Manually
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Selected Course Details */}
      {selectedCourse && (
        <CourseDetails
          selectedCourse={selectedCourse}
          selectedTeeId={selectedTeeId}
          setSelectedTeeId={setSelectedTeeId}
          holeCount={holeCount}
          setHoleCount={setHoleCount}
          onStartRound={handleStartRound}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};
