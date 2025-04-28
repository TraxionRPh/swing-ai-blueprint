
import { useNavigate } from "react-router-dom";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { InProgressRoundCard } from "@/components/round-tracking/InProgressRoundCard";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState } from "react";
import { LoadingState } from "@/components/round-tracking/loading/LoadingState";
import { RoundTrackingHeader } from "@/components/round-tracking/header/RoundTrackingHeader";
import { HoleCountSelector } from "@/components/round-tracking/hole-count/HoleCountSelector";
import { ActiveRoundContent } from "@/components/round-tracking/score/ActiveRoundContent";

const RoundTracking = () => {
  const navigate = useNavigate();
  const [showFinalScore, setShowFinalScore] = useState(false);
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
    return <LoadingState onBack={handleBack} />;
  }

  return (
    <div className="space-y-6">
      <RoundTrackingHeader onBack={handleBack} />

      {!selectedCourse && currentRoundId && !isLoading && (
        <InProgressRoundCard
          roundId={currentRoundId}
          courseName={courseName || "Loading course..."}
          lastHole={holeScores.filter(h => h.score > 0).length}
          holeCount={holeCount || 18}
          onDelete={handleDeleteRound}
        />
      )}

      {!selectedCourse && !currentRoundId && (
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
