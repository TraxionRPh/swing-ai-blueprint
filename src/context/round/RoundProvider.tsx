
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
  const [fetchTries, setFetchTries] = useState<number>(0);
  
  const {
    isLoading,
    setIsLoading,
    holeScores,
    setHoleScores,
    selectedCourse, 
    setSelectedCourse,
    holeCount,
    setHoleCount,
    fetchRoundData,
    hasFetchError
  } = useRoundData();
  
  const {
    saveInProgress,
    createRound,
    updateHoleScore: updateScore,
    finishRound: finishRoundOperation
  } = useRoundOperations(holeScores, setHoleScores, holeCount);
  
  // Restore currentRoundId from storage when component mounts
  useEffect(() => {
    try {
      // First try session storage (for current browser tab)
      let savedRoundId = sessionStorage.getItem('current-round-id');
      
      // If not in session storage, try local storage (for returning users)
      if (!savedRoundId || savedRoundId === 'new') {
        savedRoundId = localStorage.getItem('current-round-id');
      }
      
      if (savedRoundId && savedRoundId !== 'new') {
        console.log(`Restored currentRoundId from storage: ${savedRoundId}`);
        setCurrentRoundId(savedRoundId);
      }
    } catch (error) {
      console.error('Error retrieving round ID from storage:', error);
    }
  }, []);
  
  // Fetch hole scores when round ID changes
  useEffect(() => {
    if (currentRoundId && currentRoundId !== 'new') {
      if (fetchTries > 3) {
        console.log(`Stopping fetch attempts after ${fetchTries} tries`);
        return; // Stop trying after multiple failures
      }
      
      console.log(`RoundProvider: Loading data for round ${currentRoundId}`);
      fetchRoundData(currentRoundId).finally(() => {
        setFetchTries(prev => prev + 1);
      });
    }
  }, [currentRoundId, fetchRoundData, fetchTries]);
  
  // Reset fetch tries if round ID changes
  useEffect(() => {
    setFetchTries(0);
  }, [currentRoundId]);
  
  // Persist currentRoundId in both session and local storage to maintain state between page navigations
  useEffect(() => {
    if (currentRoundId) {
      try {
        // Store in both session and local storage for better persistence
        sessionStorage.setItem('current-round-id', currentRoundId);
        localStorage.setItem('current-round-id', currentRoundId);
        console.log(`Saved currentRoundId to storage: ${currentRoundId}`);
      } catch (error) {
        console.error('Error saving round ID to storage:', error);
      }
    }
  }, [currentRoundId]);
  
  // Wrapper functions to add any context-specific logic
  const updateHoleScore = async (holeData: HoleData) => {
    const success = await updateScore(holeData, currentRoundId);
    
    if (success && currentRoundId) {
      // After successfully saving, update the hole scores in state
      setHoleScores(prev => {
        const updated = [...prev];
        const index = updated.findIndex(h => h.holeNumber === holeData.holeNumber);
        if (index >= 0) {
          updated[index] = holeData;
        } else {
          // If this hole isn't in our array yet, add it
          updated.push(holeData);
        }
        return updated;
      });
    }
    
    return success;
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
    saveInProgress,
    hasFetchError
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
