
import { useNavigate } from "react-router-dom";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { RoundsDisplay } from "@/components/round-tracking/RoundsDisplay";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useState, useEffect } from "react";
import { RoundDebugPanel } from "./debug/RoundDebugPanel";
import { useRoundTracking } from "@/hooks/useRoundTracking";

interface RoundTrackingMainProps {
  onBack: () => void;
  pageLoading?: boolean;
}

export const RoundTrackingMain = ({
  onBack,
  pageLoading = false
}: RoundTrackingMainProps) => {
  const [loading, setLoading] = useState(pageLoading);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTee, setSelectedTee] = useState(null);
  const [holeCount, setHoleCount] = useState(18);
  const [currentRoundId, setCurrentRoundId] = useState(null);
  
  // Load basic tracking state
  useEffect(() => {
    console.log("RoundTrackingMain mounted");
    // Set a short timeout to ensure UI is responsive
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

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
    if (courseHoleCount) {
      setHoleCount(courseHoleCount);
    }
    handleCourseSelect(course);
  };

  return (
    <div className="space-y-6">
      <RoundTrackingHeader 
        onBack={onBack} 
        subtitle="View your rounds and start tracking new ones"
      />
      
      {loading ? (
        <Card>
          <CardContent className="pt-6 flex justify-center items-center">
            <Loading message="Loading rounds..." minHeight={150} size="md" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Rounds display showing in-progress rounds */}
          <RoundsDisplay onCourseSelect={handleCourseSelection} />
          
          {/* Course selector to start a new round */}
          <CourseSelector
            selectedCourse={selectedCourse}
            selectedTee={selectedTee}
            onCourseSelect={handleCourseSelect}
            onTeeSelect={setSelectedTee}
          />
          
          {/* Debug panel (only shown in development) */}
          <RoundDebugPanel 
            roundId={currentRoundId}
            resumeData={{
              forceResume: sessionStorage.getItem('force-resume'),
              sessionHole: sessionStorage.getItem('resume-hole-number'),
              localHole: localStorage.getItem('resume-hole-number')
            }}
          />
        </>
      )}
    </div>
  );
};
