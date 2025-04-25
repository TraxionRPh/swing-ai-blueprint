
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
    finishRound,
    holeCount,
    setHoleCount
  } = useRoundTracking();

  const handleNext = () => {
    if (currentHole === holeCount) {
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

      {selectedCourse && !holeCount && (
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4">How many holes are you playing?</h3>
          <RadioGroup 
            defaultValue="18" 
            className="grid grid-cols-2 gap-4"
            onValueChange={(value) => setHoleCount(parseInt(value))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="9" id="nine" />
              <Label htmlFor="nine">9 Holes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="18" id="eighteen" />
              <Label htmlFor="eighteen">18 Holes</Label>
            </div>
          </RadioGroup>
          <Button 
            className="mt-4 w-full" 
            onClick={() => setHoleCount(18)}
          >
            Start Round
          </Button>
        </div>
      )}

      {selectedCourse && holeCount > 0 && holeScores.length > 0 && (
        <>
          <ScoreSummary holeScores={holeScores.slice(0, holeCount)} />
          
          <HoleScoreCard
            holeData={currentHoleData}
            onUpdate={handleHoleUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentHole === 1}
            isLast={currentHole === holeCount}
            teeColor={currentTeeColor}
            courseId={selectedCourse.id}
            isSaving={isSaving}
          />

          <FinalScoreCard
            holeScores={holeScores.slice(0, holeCount)}
            isOpen={showFinalScore}
            onConfirm={handleConfirmRound}
            onCancel={() => setShowFinalScore(false)}
            holeCount={holeCount}
          />
        </>
      )}
    </div>
  );
};

export default RoundTracking;
