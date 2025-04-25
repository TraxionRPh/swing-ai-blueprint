
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { CourseSelector } from "@/components/round-tracking/CourseSelector";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import { FinalScoreCard } from "@/components/round-tracking/FinalScoreCard";
import { useRoundTracking } from "@/hooks/useRoundTracking";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Course } from "@/types/round-tracking";

const RoundTracking = () => {
  const navigate = useNavigate();
  const { roundId, holeNumber } = useParams();
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
    setHoleCount,
    setCurrentRoundId
  } = useRoundTracking();

  useEffect(() => {
    // If we have a roundId from URL params, set it in the context
    if (roundId && roundId !== 'new') {
      setCurrentRoundId(roundId);
      
      // If we also have a holeNumber, we might want to navigate to that specific hole
      // This would require additional handling in the useRoundTracking hook
    }
    
    // If we have a roundId from URL params, check if there's a stored hole count
    if (roundId) {
      const storedHoleCount = sessionStorage.getItem('current-hole-count');
      if (storedHoleCount) {
        setHoleCount(parseInt(storedHoleCount));
      }
    }
  }, [roundId, holeNumber, setHoleCount, setCurrentRoundId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    if (currentHole === holeCount) {
      setShowFinalScore(true);
    } else {
      baseHandleNext();
    }
  };

  const handleConfirmRound = async () => {
    await finishRound();
    setShowFinalScore(false);
  };

  const handleCourseSelection = (course: Course, selectedHoleCount?: number) => {
    if (selectedHoleCount) {
      setHoleCount(selectedHoleCount);
      handleCourseSelect(course);
    } else if (!holeCount) {
      // Only show the hole count selector if holeCount hasn't been set yet
      // and wasn't provided by the course selection
      return;
    } else {
      handleCourseSelect(course);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleBack}
          className="text-muted-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
          <p className="text-muted-foreground">
            Track your round hole by hole
          </p>
        </div>
      </div>

      <CourseSelector
        selectedCourse={selectedCourse}
        selectedTee={selectedTee}
        onCourseSelect={handleCourseSelection}
        onTeeSelect={setSelectedTee}
      />

      {selectedCourse && !holeCount && (
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-4">How many holes are you playing?</h3>
          <RadioGroup 
            defaultValue="18" 
            className="grid grid-cols-2 gap-4"
            onValueChange={(value) => {
              const count = parseInt(value);
              setHoleCount(count);
              // After setting hole count, automatically continue with the selected course
              handleCourseSelect(selectedCourse);
            }}
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
        </div>
      )}

      {selectedCourse && holeCount > 0 && (
        <>
          {holeScores.length > 0 && (
            <ScoreSummary holeScores={holeScores.slice(0, holeCount)} />
          )}
          
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
