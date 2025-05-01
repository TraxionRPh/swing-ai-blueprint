
import { useEffect, useState } from "react";
import { useRoundScoreTracker } from "@/hooks/useRoundScoreTracker";
import { HoleScoreView } from "@/components/round-tracking/score/HoleScoreView";

interface Props {
  onBack: () => void;
  currentRoundId: string | null;
  initialHoleNumber: number | null;
  retryLoading: () => void;
  setDetailLoading: (value: boolean) => void;
  setDetailError: (value: string | null) => void;
  courseId?: string | null;
  teeId?: string | null;
}

export const RoundTrackingDetail = ({
  onBack,
  currentRoundId,
  initialHoleNumber,
  retryLoading,
  setDetailLoading,
  setDetailError,
  courseId,
  teeId,
}: Props) => {
  const {
    currentHole,
    setCurrentHole,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    saveSuccess,
    saveError,
    isLoading,
    currentHoleData,
    clearResumeData,
  } = useRoundScoreTracker(currentRoundId, courseId || undefined, teeId || undefined);

  useEffect(() => {
    if (initialHoleNumber) {
      setCurrentHole(initialHoleNumber);
    }
  }, [initialHoleNumber, setCurrentHole]);

  useEffect(() => {
    setDetailLoading(isLoading);
    if (!isLoading && !holeScores.length) {
      setDetailError("No hole data found");
    } else {
      setDetailError(null);
    }
  }, [isLoading, holeScores, setDetailError, setDetailLoading]);

  return (
    <HoleScoreView
      onBack={onBack}
      currentHole={currentHole}
      setCurrentHole={setCurrentHole}
      holeScores={holeScores}
      handleHoleUpdate={handleHoleUpdate}
      handleNext={handleNext}
      handlePrevious={handlePrevious}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
      saveError={saveError}
      currentHoleData={currentHoleData}
      isLoading={isLoading}
      clearResumeData={clearResumeData}
    />
  );
};
