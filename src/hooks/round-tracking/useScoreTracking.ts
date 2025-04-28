
import type { HoleData } from "@/types/round-tracking";
import { useHoleNavigation } from "./score/useHoleNavigation";
import { useHoleScores } from "./score/useHoleScores";
import { useHolePersistence } from "./score/useHolePersistence";

export const useScoreTracking = (roundId: string | null, courseId?: string) => {
  const { currentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { holeScores, setHoleScores, isLoading } = useHoleScores(roundId, courseId);
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);

  const handleHoleUpdate = (data: HoleData) => {
    console.log('Updating hole data:', data);
    setHoleScores(prev => 
      prev.map(hole => 
        hole.holeNumber === data.holeNumber ? data : hole
      )
    );
    
    if (roundId) {
      saveHoleScore(data);
    }
  };

  const currentHoleData = holeScores.find(hole => hole.holeNumber === currentHole) || {
    holeNumber: currentHole,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false
  };

  console.log('Current hole data:', currentHoleData);

  return {
    currentHole,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving: isSaving || isLoading,
    currentHoleData
  };
};

