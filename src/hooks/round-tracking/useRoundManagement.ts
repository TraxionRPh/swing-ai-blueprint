
import { useState, useEffect } from "react";
import { useRoundId } from "./round-management";
import { useInProgressRound } from "./round-management";
import { useRoundFinalization } from "./round-management";
import { useRoundDeletion } from "./round-management";

export const useRoundManagement = () => {
  const { currentRoundId, setCurrentRoundId, saveRoundIdToStorage } = useRoundId();
  const { fetchInProgressRound } = useInProgressRound();
  const { finishRound } = useRoundFinalization();
  const { deleteRound } = useRoundDeletion();

  // Add loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Try to restore round ID from storage on initial load
  useEffect(() => {
    if (!currentRoundId) {
      const storedRoundId = sessionStorage.getItem('current-round-id') || localStorage.getItem('current-round-id');
      
      if (storedRoundId) {
        console.log(`Restoring round ID from storage: ${storedRoundId}`);
        setCurrentRoundId(storedRoundId);
      }
    }
  }, [currentRoundId, setCurrentRoundId]);

  return {
    currentRoundId,
    setCurrentRoundId,
    saveRoundIdToStorage,
    fetchInProgressRound,
    finishRound,
    deleteRound,
    isLoading,
    setIsLoading
  };
};
