
import { useNavigate } from "react-router-dom";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { RoundsDisplay } from "@/components/round-tracking/RoundsDisplay";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useState, useEffect } from "react";

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
    }
    handleCourseSelect(course);
  };
  
  // Start a new round
  const handleStartNewRound = () => {
    navigate('/rounds/new');
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
          {/* Action button to start new round */}
          <Card>
            <CardContent className="pt-6 flex justify-center items-center">
              <Button 
                onClick={handleStartNewRound}
                className="w-full py-6 text-lg"
              >
                Start New Round
              </Button>
            </CardContent>
          </Card>
          
          {/* Rounds display showing in-progress rounds */}
          <RoundsDisplay 
            onCourseSelect={handleCourseSelection} 
            onError={(error) => {
              console.error("Rounds display error:", error);
              if (setMainError) setMainError(error);
            }}
          />
        </>
      )}
    </div>
  );
};
