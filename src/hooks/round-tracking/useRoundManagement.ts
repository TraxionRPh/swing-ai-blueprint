
import { useRoundInitializer } from "./useRoundInitializer";
import { useRoundCompletion } from "./useRoundCompletion";
import { useRoundDeletion } from "./useRoundDeletion";

export const useRoundManagement = (user: any) => {
  const { currentRoundId, setCurrentRoundId, fetchInProgressRound } = useRoundInitializer(user);
  const { finishRound } = useRoundCompletion(currentRoundId, setCurrentRoundId);
  const { deleteRound } = useRoundDeletion(setCurrentRoundId);

  return {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound,
    finishRound,
    deleteRound
  };
};
