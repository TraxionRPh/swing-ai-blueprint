
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState } from "react";

const RoundTracking = () => {
  const [showFinalScore, setShowFinalScore] = useState(false);
  const {
    selectedCourse,
    selectedTee,
    holeScores,
    handleCourseSelect,
    setSelectedTee,
    handleHoleUpdate,
    handleNext: baseHandleNext,
    handlePrevious,
    currentHole,
    currentTeeColor,
    currentHoleData,
    isSaving,
    finishRound
  } = useRoundTracking();

  const handleNext = () => {
    if (currentHole === 18) {
      setShowFinalScore(true);
    } else {
      baseHandleNext();
    }
  };

  const handleConfirmRound = async () => {
    await finishRound(holeScores);
    setShowFinalScore(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
        <p className="text-muted-foreground">
          Track your round hole by hole
        </p>
      </div>

      <CourseSelector
        selectedCourse={selectedCourse}
        selectedTee={selectedTee}
        onCourseSelect={handleCourseSelect}
        onTeeSelect={setSelectedTee}
      />

      {selectedCourse && holeScores.length > 0 && (
        <>
          <ScoreSummary holeScores={holeScores} />
          
          <HoleScoreCard
            holeData={currentHoleData}
            onUpdate={handleHoleUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentHole === 1}
            isLast={currentHole === 18}
            teeColor={currentTeeColor}
            courseId={selectedCourse.id}
            isSaving={isSaving}
          />

          <FinalScoreCard
            holeScores={holeScores}
            isOpen={showFinalScore}
            onConfirm={handleConfirmRound}
            onCancel={() => setShowFinalScore(false)}
          />
        </>
      )}
    </div>
  );
};

export default RoundTracking;
