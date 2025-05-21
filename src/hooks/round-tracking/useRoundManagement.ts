
import { useState } from "react";
import { useRoundId } from "./round-management";
import { useInProgressRound } from "./round-management";
import { useRoundFinalization } from "./round-management";
import { useRoundDeletion } from "./round-management";

export const useRoundManagement = () => {
  const { currentRoundId, setCurrentRoundId } = useRoundId();
  const { fetchInProgressRound } = useInProgressRound();
  const { finishRound } = useRoundFinalization();
  const { deleteRound } = useRoundDeletion();

  // Add loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound,
    deleteRound,
    isLoading,
    setIsLoading
  };
};
