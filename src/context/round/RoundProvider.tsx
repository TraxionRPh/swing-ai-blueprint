
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRoundData } from "./useRoundData";
import { useRoundOperations } from "./useRoundOperations";
import { RoundContextType } from "./types";
import { HoleData, Course } from "@/types/round-tracking";

const RoundContext = createContext<RoundContextType | undefined>(undefined);

export const RoundProvider = ({ children }: { children: ReactNode }) => {
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [currentHoleNumber, setCurrentHoleNumber] = useState<number>(1);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  
  const {
    isLoading,
    setIsLoading,
    holeScores,
    setHoleScores,
    selectedCourse, 
    setSelectedCourse,
    holeCount,
    setHoleCount,
    fetchRoundData
  } = useRoundData();
  
  const {
    saveInProgress,
    createRound,
    updateHoleScore: updateScore,
    finishRound: finishRoundOperation
  } = useRoundOperations(holeScores, setHoleScores, holeCount);
  
  // Fetch hole scores when round ID changes
  useEffect(() => {
    if (currentRoundId && currentRoundId !== 'new') {
      fetchRoundData(currentRoundId);
    }
  }, [currentRoundId]);
  
  // Wrapper functions to add any context-specific logic
  const updateHoleScore = async (holeData: HoleData) => {
    return await updateScore(holeData, currentRoundId);
  };
  
  const finishRound = async () => {
    return await finishRoundOperation(currentRoundId);
  };
  
  const value: RoundContextType = {
    currentRoundId,
    setCurrentRoundId,
    currentHoleNumber,
    setCurrentHoleNumber,
    holeCount,
    setHoleCount,
    selectedCourse,
    setSelectedCourse,
    selectedTeeId,
    setSelectedTeeId,
    holeScores,
    setHoleScores,
    updateHoleScore,
    createRound,
    finishRound,
    isLoading,
    setIsLoading,
    saveInProgress
  };
  
  return <RoundContext.Provider value={value}>{children}</RoundContext.Provider>;
};

export const useRound = () => {
  const context = useContext(RoundContext);
  if (context === undefined) {
    throw new Error("useRound must be used within a RoundProvider");
  }
  return context;
};
