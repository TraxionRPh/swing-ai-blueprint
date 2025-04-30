
import { useNavigate } from "react-router-dom";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { RoundsDisplay } from "@/components/round-tracking/RoundsDisplay";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useState, useEffect } from "react";
import { RoundDebugPanel } from "./debug/RoundDebugPanel";

interface RoundTrackingMainProps {
  onBack: () => void;
  pageLoading: boolean;
  roundTracking: any;
}

export const RoundTrackingMain = ({
  onBack,
  pageLoading,
  roundTracking
}: RoundTrackingMainProps) => {
  const {
    selectedCourse,
    handleCourseSelect,
    setSelectedTee,
    setHoleCount,
    currentRoundId
  } = roundTracking;

  const handleCourseSelection = (course: any, courseHoleCount: number | null) => {
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
      
      {pageLoading ? (
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
            selectedTee={roundTracking.selectedTee}
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
