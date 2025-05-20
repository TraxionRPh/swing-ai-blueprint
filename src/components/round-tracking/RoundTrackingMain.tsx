
import { useNavigate } from "react-router-dom";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { RoundsDisplay } from "@/components/round-tracking/RoundsDisplay";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface RoundTrackingMainProps {
  onBack: () => void;
  pageLoading?: boolean;
  setMainLoading?: (loading: boolean) => void;
  setMainError?: (error: string | null) => void;
}

export const RoundTrackingMain = ({
  onBack,
  pageLoading = false,
  setMainLoading,
  setMainError
}: RoundTrackingMainProps) => {
  const [localLoading, setLocalLoading] = useState(pageLoading);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTee, setSelectedTee] = useState(null);
  const [holeCount, setHoleCount] = useState(18);
  const navigate = useNavigate();
  
  console.log("RoundTrackingMain rendered with localLoading:", localLoading);
  
  // Exit loading state right away
  useEffect(() => {
    console.log("RoundTrackingMain mounted, setting loading to false");
    setLocalLoading(false);
    if (setMainLoading) setMainLoading(false);
  }, [setMainLoading]);

  // Handle course selection
  const handleCourseSelect = (course) => {
    console.log("Course selected:", course.name);
    setSelectedCourse(course);
    
    // Set first tee as default if available
    if (course.course_tees && course.course_tees.length > 0) {
      setSelectedTee(course.course_tees[0].id);
    }
  };

  // Handle course selection that might include hole count
  const handleCourseSelection = (course, courseHoleCount) => {
    console.log("Course selected with hole count:", courseHoleCount);
    if (courseHoleCount) {
      setHoleCount(courseHoleCount);
      // Store the hole count in session storage
      sessionStorage.setItem('current-hole-count', courseHoleCount.toString());
    }
    handleCourseSelect(course);
  };

  // Handle hole count selection
  const handleHoleCountChange = (count: number) => {
    console.log("Setting hole count to:", count);
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  };

  // Start a new round with the selected parameters
  const startNewRound = () => {
    console.log("Starting new round with:", {
      course: selectedCourse?.name,
      teeId: selectedTee,
      holeCount
    });
    
    // Store selected options in session storage
    if (selectedCourse) {
      sessionStorage.setItem('current-course-id', selectedCourse.id);
    }
    
    if (selectedTee) {
      sessionStorage.setItem('current-tee-id', selectedTee);
    }
    
    sessionStorage.setItem('current-hole-count', holeCount.toString());
    
    // Navigate based on the hole count (either 9-hole or 18-hole specific routes)
    if (holeCount === 9) {
      navigate('/rounds/new/9');
    } else {
      navigate('/rounds/new/18');
    }
  };

  return (
    <div className="space-y-6">
      <RoundTrackingHeader 
        onBack={onBack} 
        subtitle="View your rounds and start tracking new ones"
      />
      
      {localLoading ? (
        <Card>
          <CardContent className="pt-6 flex justify-center items-center">
            <Loading message="Loading rounds..." minHeight={150} size="md" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Rounds display showing in-progress rounds */}
          <RoundsDisplay 
            onCourseSelect={handleCourseSelection} 
            onError={(error) => {
              console.error("Rounds display error:", error);
              if (setMainError) setMainError(error);
            }}
          />
          
          {/* Course selector to start a new round */}
          <CourseSelector
            selectedCourse={selectedCourse}
            selectedTee={selectedTee}
            onCourseSelect={handleCourseSelect}
            onTeeSelect={setSelectedTee}
          />
          
          {/* Hole count selector */}
          {selectedCourse && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Select hole count</h3>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleHoleCountChange(9)}
                    variant={holeCount === 9 ? "default" : "outline"}
                    className="flex-1"
                  >
                    9 Holes
                  </Button>
                  <Button 
                    onClick={() => handleHoleCountChange(18)}
                    variant={holeCount === 18 ? "default" : "outline"}
                    className="flex-1"
                  >
                    18 Holes
                  </Button>
                </div>
                
                <Button 
                  onClick={startNewRound}
                  className="w-full mt-4"
                  disabled={!selectedCourse || !selectedTee}
                >
                  Start Round
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
