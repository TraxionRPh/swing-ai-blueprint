
import { useNavigate } from "react-router-dom";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect } from "react";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { ActiveRoundContent } from "@/components/round-tracking/score/ActiveRoundContent";
import { RoundsDisplay } from "@/components/round-tracking/RoundsDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

const RoundTracking = () => {
  const navigate = useNavigate();
  const [showFinalScore, setShowFinalScore] = useState(false);
  
  // Only load the complex hook if we're not on the main page
  const isMainPage = window.location.pathname === '/rounds';
  const isDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);
  
  // Simplified loading for the main page
  const [pageLoading, setPageLoading] = useState(!isMainPage);
  
  useEffect(() => {
    // If we're on the main rounds page, set loading to false after a short delay
    if (isMainPage) {
      const timer = setTimeout(() => setPageLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isMainPage]);
  
  // Only use the complex hook when necessary (for detail pages or active rounds)
  const roundTracking = useRoundTracking();
  
  const {
    selectedCourse,
    currentHole,
    holeScores,
    currentRoundId,
    handleCourseSelect,
    setSelectedTee,
    handleHoleUpdate,
    handleNext: moveToNextHole,
    handlePrevious,
    currentTeeColor,
    currentHoleData,
    isSaving,
    finishRound,
    holeCount,
    setHoleCount,
    isLoading: hookIsLoading
  } = roundTracking;

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      moveToNextHole();
    }
  };

  const handleConfirmRound = async () => {
    const success = await finishRound();
    setShowFinalScore(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleHoleCountSelect = (count: number) => {
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  };

  // Main page - show rounds display and course selector
  if (isMainPage) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader 
          onBack={handleBack} 
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
            <RoundsDisplay 
              onCourseSelect={(course, courseHoleCount) => {
                if (courseHoleCount) {
                  setHoleCount(courseHoleCount);
                }
                handleCourseSelect(course);
              }} 
            />
            
            {/* Course selector to start a new round */}
            <CourseSelector
              selectedCourse={selectedCourse}
              selectedTee={roundTracking.selectedTee}
              onCourseSelect={handleCourseSelect}
              onTeeSelect={setSelectedTee}
            />
          </>
        )}
      </div>
    );
  }

  // Round detail page - show specific round
  if (isDetailPage && currentRoundId) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBack} />
        
        {hookIsLoading ? (
          <Loading message="Loading round data..." />
        ) : (
          <ActiveRoundContent
            holeScores={holeScores}
            currentHoleData={currentHoleData}
            onHoleUpdate={handleHoleUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentHole={currentHole}
            holeCount={holeCount || 18}
            teeColor={currentTeeColor}
            courseId={selectedCourse?.id}
            isSaving={isSaving}
            showFinalScore={showFinalScore}
            onConfirmRound={handleConfirmRound}
            onCancelFinalScore={() => setShowFinalScore(false)}
          />
        )}
      </div>
    );
  }

  // All other pages in the round flow
  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={handleBack} />
      
      {hookIsLoading ? (
        <Loading message="Loading round data..." />
      ) : (
        <ActiveRoundContent
          holeScores={holeScores}
          currentHoleData={currentHoleData}
          onHoleUpdate={handleHoleUpdate}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentHole={currentHole}
          holeCount={holeCount || 18}
          teeColor={currentTeeColor}
          courseId={selectedCourse?.id}
          isSaving={isSaving}
          showFinalScore={showFinalScore}
          onConfirmRound={handleConfirmRound}
          onCancelFinalScore={() => setShowFinalScore(false)}
        />
      )}
    </div>
  );
};

export default RoundTracking;
