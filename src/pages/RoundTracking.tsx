
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

  useEffect(() => {
    // Set a timeout to show a refresh option if loading takes too long
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Force re-render after a major operation like navigation
  useEffect(() => {
    console.log("Component mounted or route changed");
    
    // Clear any timeouts when component unmounts
    return () => {
      console.log("Component will unmount");
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

  // Debug logs to help diagnose rendering conditions
  console.log("Round tracking render conditions:", { 
    selectedCourse: !!selectedCourse, 
    currentRoundId: !!currentRoundId, 
    isLoading,
    currentPath: window.location.pathname
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

  // We're on the main rounds list page
  if (window.location.pathname === '/rounds' && !currentRoundId) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBack} />
        <CourseSelector
          selectedCourse={selectedCourse}
          selectedTee={selectedTee}
          onCourseSelect={handleCourseSelect}
          onTeeSelect={setSelectedTee}
        />
      </div>
    );
  }

  // We're on the main rounds list page with in-progress round
  if (window.location.pathname === '/rounds' && currentRoundId && !selectedCourse) {
    return (
      <div className="space-y-6">
        <RoundTrackingHeader onBack={handleBack} />
        <InProgressRoundCard
          roundId={currentRoundId}
          courseName={courseName || "Loading course..."}
          lastHole={holeScores.filter(h => h.score > 0).length}
          holeCount={holeCount || 18}
          onDelete={handleDeleteRound}
        />
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
