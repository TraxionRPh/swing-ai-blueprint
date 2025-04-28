
import { useNavigate } from "react-router-dom";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { InProgressRoundCard } from "@/components/round-tracking/InProgressRoundCard";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect } from "react";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { HoleCountSelector } from "@/components/round-tracking/hole-count/HoleCountSelector";
import { ActiveRoundContent } from "@/components/round-tracking/score/ActiveRoundContent";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { RoundsDisplay } from "@/components/round-tracking/RoundsDisplay";

const RoundTracking = () => {
  const navigate = useNavigate();
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { toast } = useToast();
  
  const {
    selectedCourse,
    selectedTee,
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
    setCurrentRoundId,
    deleteRound,
    courseName,
    isLoading
  } = useRoundTracking();

  // Show refresh option if loading takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Clear any timeouts when component unmounts
  useEffect(() => {
    console.log("Round tracking component mounted");
    
    return () => {
      console.log("Round tracking component unmounted");
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    console.log("Manual refresh requested");
    window.location.reload();
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

  const handleDeleteRound = () => {
    if (currentRoundId) {
      deleteRound(currentRoundId);
      
      // Force clear the current round ID to ensure fresh state
      setCurrentRoundId(null);
    }
  };

  const handleHoleCountSelect = (count: number) => {
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
    if (selectedCourse) {
      handleCourseSelect(selectedCourse);
    }
  };

  // Check if we're on a specific round page
  const isRoundDetailPage = window.location.pathname.match(/\/rounds\/[a-zA-Z0-9-]+$/);

  // Debug logs to help diagnose rendering conditions
  console.log("Round tracking render conditions:", { 
    selectedCourse: !!selectedCourse, 
    currentRoundId: !!currentRoundId, 
    isLoading,
    currentPath: window.location.pathname,
    isRoundDetailPage: !!isRoundDetailPage
  });

  if (isLoading) {
    return (
      <LoadingState onBack={handleBack}>
        {loadingTimeout && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Taking longer than expected. There might be a connection issue.
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh page
            </Button>
          </div>
        )}
      </LoadingState>
    );
  }

  // If we're on the round detail page with active round, show the round content
  if (isRoundDetailPage && currentRoundId) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBack} />
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
      </div>
    );
  }

  // We're on the main rounds list page
  if (window.location.pathname === '/rounds') {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBack} />
        
        {/* Always show RoundsDisplay with any in-progress rounds */}
        <RoundsDisplay 
          onCourseSelect={(course, holeCount) => {
            if (holeCount) {
              setHoleCount(holeCount);
            }
            handleCourseSelect(course);
          }} 
        />
        
        {/* Always show CourseSelector as well */}
        <CourseSelector
          selectedCourse={selectedCourse}
          selectedTee={selectedTee}
          onCourseSelect={handleCourseSelect}
          onTeeSelect={setSelectedTee}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={handleBack} />

      {selectedCourse && !holeCount && (
        <HoleCountSelector
          selectedCourse={selectedCourse}
          onHoleCountSelect={handleHoleCountSelect}
        />
      )}

      {selectedCourse && holeCount > 0 && (
        <ActiveRoundContent
          holeScores={holeScores}
          currentHoleData={currentHoleData}
          onHoleUpdate={handleHoleUpdate}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentHole={currentHole}
          holeCount={holeCount}
          teeColor={currentTeeColor}
          courseId={selectedCourse.id}
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
