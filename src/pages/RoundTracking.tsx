
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import { useRoundTracking } from "@/hooks/useRoundTracking";

const RoundTracking = () => {
  const {
    selectedCourse,
    selectedTee,
    holeScores,
    handleCourseSelect,
    setSelectedTee,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    currentHole,
    currentTeeColor,
    currentHoleData
  } = useRoundTracking();

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
          />
        </>
      )}
    </div>
  );
};

export default RoundTracking;
