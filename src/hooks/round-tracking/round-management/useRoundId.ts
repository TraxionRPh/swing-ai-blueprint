
import { useState } from "react";

export const useRoundId = () => {
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  
  // Add a function to save the round ID to storage
  const saveRoundIdToStorage = (roundId: string) => {
    try {
      if (roundId) {
        sessionStorage.setItem('current-round-id', roundId);
        localStorage.setItem('current-round-id', roundId);
        console.log(`Saved round ID to storage: ${roundId}`);
      }
    } catch (error) {
      console.error('Failed to save round ID to storage:', error);
    }
  };
  
  // Enhanced setCurrentRoundId that also saves to storage
  const setAndSaveCurrentRoundId = (roundId: string | null) => {
    setCurrentRoundId(roundId);
    if (roundId) {
      saveRoundIdToStorage(roundId);
    }
  };
  
  return {
    currentRoundId,
    setCurrentRoundId: setAndSaveCurrentRoundId,
    saveRoundIdToStorage
  };
};
