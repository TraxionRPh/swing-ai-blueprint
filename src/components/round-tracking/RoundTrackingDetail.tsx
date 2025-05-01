
import { useEffect, useState } from "react";
import { useScoreTracking } from "@/hooks/round-tracking/score/useScoreTracking";
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
  const [holeScores, setHoleScores] = useState([]);
  const [currentHole, setCurrentHole] = useState(initialHoleNumber || 1);
  const [holeCount, setHoleCount] = useState(18);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData,
    clearResumeData,
  } = useScoreTracking(currentRoundId, courseId || undefined, holeScores, setHoleScores);

  useEffect(() => {
    if (initialHoleNumber) {
      setCurrentHole(initialHoleNumber);
    }
  }, [initialHoleNumber]);

  useEffect(() => {
    setDetailLoading(isLoading);
    if (!isLoading && !holeScores.length) {
      setDetailError("No hole data found");
    } else {
      setDetailError(null);
    }
    
    // Set loading to false after a short delay to ensure UI updates
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isLoading, holeScores, setDetailError, setDetailLoading]);

  return (
    <HoleScoreView
      currentHoleData={currentHoleData}
      handleHoleUpdate={handleHoleUpdate}
      handleNext={handleNext}
      handlePrevious={handlePrevious}
      currentHole={currentHole}
      holeCount={holeCount}
      isSaving={isSaving}
      isLoading={isLoading}
      holeScores={holeScores}
      teeColor={teeId ? "blue" : undefined}
      courseId={courseId || undefined}
      teeId={teeId || undefined}
    />
  );
};
