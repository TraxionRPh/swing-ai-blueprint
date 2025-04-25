
import type { HoleData } from "@/types/round-tracking";
import { useHoleNavigation } from "./score/useHoleNavigation";
import { useHolePersistence } from "./score/useHolePersistence";
import { useHoleScores } from "./score/useHoleScores";

export const useScoreTracking = (roundId: string | null) => {
  const { currentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { holeScores, setHoleScores } = useHoleScores(roundId);
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);

  const handleHoleUpdate = (data: HoleData) => {
    setHoleScores(prev => 
      prev.map(hole => 
        hole.holeNumber === data.holeNumber ? data : hole
      )
    );
    
    saveHoleScore(data);
  };

  return {
    currentHole,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData: holeScores.find(hole => hole.holeNumber === currentHole) || {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }
  };
};
