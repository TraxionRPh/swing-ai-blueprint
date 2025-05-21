
import { useState, useEffect } from "react";
import { HoleData, Course } from "@/types/round-tracking";
import { useRoundCache } from "./useRoundCache";
import { useRoundData } from "../useRoundData";
import { useRoundOperations } from "../useRoundOperations";

// Maximum number of fetch attempts
const MAX_FETCH_ATTEMPTS = 3;

export const useRoundState = (initialRoundId: string | null) => {
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(initialRoundId || null);
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

  const {
    loadFromCache,
    saveToCache,
    clearCache,
    saveRoundIdToStorage,
    loadRoundIdFromStorage
  } = useRoundCache(currentRoundId, selectedCourse, holeCount, holeScores);

  // Check if round data is in cache or restore from storage
  useEffect(() => {
    const savedRoundId = loadRoundIdFromStorage();
    
    if (savedRoundId && savedRoundId !== 'new') {
      console.log(`Restored currentRoundId from storage: ${savedRoundId}`);
      setCurrentRoundId(savedRoundId);

      // Check if we have a cache for this round
      const cachedData = loadFromCache(savedRoundId);
      if (cachedData) {
        if (cachedData.course) {
          setSelectedCourse(cachedData.course);
        }
        
        if (cachedData.holeCount) {
          setHoleCount(cachedData.holeCount);
        }
        
        if (cachedData.holeScores && cachedData.holeScores.length > 0) {
          setHoleScores(cachedData.holeScores);
        }
        
        // Mark as loaded since we're using cache
        setIsLoading(false);
      }
    }
  }, [setSelectedCourse, setHoleCount, setHoleScores, setIsLoading]);

  // Fetch hole scores when round ID changes (only if no cache)
  useEffect(() => {
    if (currentRoundId && currentRoundId !== 'new') {
      // Check if we already have cache data
      const cachedData = loadFromCache(currentRoundId);
      if (cachedData) {
        console.log(`Using existing cache for round ${currentRoundId}, skipping fetch`);
        return;
      }
      
      // Prevent infinite fetching - only try a few times
      if (fetchTries >= MAX_FETCH_ATTEMPTS) {
        console.log(`Stopping fetch attempts after ${fetchTries} tries`);
        setIsLoading(false); // Stop loading if we've reached max attempts
        return;
      }
      
      console.log(`RoundProvider: Loading data for round ${currentRoundId} (attempt ${fetchTries + 1}/${MAX_FETCH_ATTEMPTS})`);
      fetchRoundData(currentRoundId).then(data => {
        // If fetch successful, cache the data
        if (data) {
          saveToCache(currentRoundId);
        }
      }).catch(error => {
        console.error("Error fetching round data:", error);
        if (fetchTries + 1 >= MAX_FETCH_ATTEMPTS) {
          setIsLoading(false); // Stop loading after max attempts
        }
      }).finally(() => {
        setFetchTries(prev => prev + 1);
      });
    }
  }, [currentRoundId, fetchRoundData, fetchTries, setIsLoading]);

  // Reset fetch tries if round ID changes
  useEffect(() => {
    setFetchTries(0);
  }, [currentRoundId]);

  // Persist currentRoundId in both session and local storage
  useEffect(() => {
    if (currentRoundId) {
      saveRoundIdToStorage(currentRoundId);
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
        
        // Update cache with new scores
        saveToCache(currentRoundId);
        
        return updated;
      });
    }
    
    return success;
  };

  const finishRound = async () => {
    const result = await finishRoundOperation(currentRoundId);
    
    if (result && currentRoundId) {
      // Clear cache on successful finish
      clearCache(currentRoundId);
    }
    
    return result;
  };

  return {
    currentRoundId,
    setCurrentRoundId,
    currentHoleNumber,
    setCurrentHoleNumber,
    selectedTeeId,
    setSelectedTeeId,
    holeCount,
    setHoleCount,
    selectedCourse,
    setSelectedCourse,
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
};
