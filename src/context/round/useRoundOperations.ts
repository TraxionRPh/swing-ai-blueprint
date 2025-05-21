
import { useState } from "react";
import { HoleData } from "@/types/round-tracking";
import { useCreateRound } from "./operations/createRound";
import { useUpdateHoleScore } from "./operations/updateHoleScore";
import { useFinishRound } from "./operations/finishRound";

export const useRoundOperations = (
  holeScores: HoleData[], 
  setHoleScores: React.Dispatch<React.SetStateAction<HoleData[]>>,
  holeCount: number
) => {
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  
  // Fix: Update property name from saveInProgress to isCreating to match what useCreateRound returns
  const { createRound: createNewRound, isCreating: createInProgress } = useCreateRound();
  const { updateHoleScore: updateScore, saveInProgress: updateInProgress } = useUpdateHoleScore();
  const { finishRound: finishRoundOperation, saveInProgress: finishInProgress } = useFinishRound();
  
  // Create a new round with optimized handling
  const createRound = async (courseId: string, teeId: string | null) => {
    setSaveInProgress(true);
    try {
      console.log(`Creating round with ${holeCount} holes`);
      // Directly return the round ID without additional processing
      return await createNewRound(courseId, teeId, holeCount);
    } catch (error) {
      console.error("Error in createRound:", error);
      throw error; // Re-throw to allow proper error handling upstream
    } finally {
      setSaveInProgress(false);
    }
  };
  
  // Update a hole score
  const updateHoleScore = async (holeData: HoleData, currentRoundId: string | null) => {
    setSaveInProgress(true);
    try {
      const success = await updateScore(holeData, currentRoundId);
      return success;
    } finally {
      setSaveInProgress(false);
    }
  };
  
  // Finish the round and calculate totals
  const finishRound = async (currentRoundId: string | null) => {
    setSaveInProgress(true);
    try {
      const success = await finishRoundOperation(currentRoundId);
      return success;
    } finally {
      setSaveInProgress(false);
    }
  };

  // Combined saveInProgress state
  const isInProgress = saveInProgress || createInProgress || updateInProgress || finishInProgress;

  return {
    saveInProgress: isInProgress,
    createRound,
    updateHoleScore,
    finishRound
  };
};
