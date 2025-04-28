
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
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
      navigate('/rounds');
    }
  };

  const handleHoleCountSelect = (count: number) => {
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
    if (selectedCourse) {
      handleCourseSelect(selectedCourse);
    }
  };

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

  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={handleBack} />

      {/* Handle in-progress round display */}
      {!selectedCourse && currentRoundId && !isLoading && (
        <InProgressRoundCard
          roundId={currentRoundId}
          courseName={courseName || "Loading course..."}
          lastHole={holeScores.filter(h => h.score > 0).length}
          holeCount={holeCount || 18}
          onDelete={handleDeleteRound}
        />
      )}

      {/* Show course selector when no course is selected AND no current round */}
      {!selectedCourse && !currentRoundId && !isLoading && (
        <CourseSelector
          selectedCourse={selectedCourse}
          selectedTee={selectedTee}
          onCourseSelect={handleCourseSelect}
          onTeeSelect={setSelectedTee}
        />
      )}

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
