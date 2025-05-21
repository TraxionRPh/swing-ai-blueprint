
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRoundData } from "./useRoundData";
import { useRoundOperations } from "./useRoundOperations";
import { RoundContextType } from "./types";
import { HoleData, Course } from "@/types/round-tracking";

const RoundContext = createContext<RoundContextType | undefined>(undefined);

// Cache key constants
const ROUND_CACHE_PREFIX = "cached-round-";
const CACHE_EXPIRY_KEY = "cache-expiry-";
// Maximum number of fetch attempts
const MAX_FETCH_ATTEMPTS = 3;

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
  
  // Check if round data is in cache or restore from storage
  useEffect(() => {
    try {
      // First check if we're in the middle of a page reload for the same round
      let savedRoundId = sessionStorage.getItem('current-round-id');
      
      // If not in session storage, try local storage (for returning users)
      if (!savedRoundId || savedRoundId === 'new') {
        savedRoundId = localStorage.getItem('current-round-id');
      }
      
      if (savedRoundId && savedRoundId !== 'new') {
        console.log(`Restored currentRoundId from storage: ${savedRoundId}`);
        setCurrentRoundId(savedRoundId);

        // Check if we have a cache for this round
        const cachedRound = localStorage.getItem(ROUND_CACHE_PREFIX + savedRoundId);
        const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY + savedRoundId);
        
        if (cachedRound && cacheExpiry) {
          const expiryTime = parseInt(cacheExpiry);
          
          // If cache hasn't expired (1 day = 86400000 ms)
          if (expiryTime > Date.now()) {
            console.log(`Using cached data for round ${savedRoundId}`);
            try {
              const parsedData = JSON.parse(cachedRound);
              
              if (parsedData.course) {
                setSelectedCourse(parsedData.course);
              }
              
              if (parsedData.holeCount) {
                setHoleCount(parsedData.holeCount);
              }
              
              if (parsedData.holeScores && parsedData.holeScores.length > 0) {
                setHoleScores(parsedData.holeScores);
              }
              
              // Mark as loaded since we're using cache
              setIsLoading(false);
              return;
            } catch (parseError) {
              console.error("Error parsing cached round data:", parseError);
            }
          } else {
            // Cache expired, remove it
            localStorage.removeItem(ROUND_CACHE_PREFIX + savedRoundId);
            localStorage.removeItem(CACHE_EXPIRY_KEY + savedRoundId);
          }
        }
      }
    } catch (error) {
      console.error('Error retrieving round ID from storage:', error);
    }
  }, [setSelectedCourse, setHoleCount, setHoleScores, setIsLoading]);
  
  // Fetch hole scores when round ID changes (only if no cache)
  useEffect(() => {
    if (currentRoundId && currentRoundId !== 'new') {
      // Check if we already have cache data
      const cachedRound = localStorage.getItem(ROUND_CACHE_PREFIX + currentRoundId);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY + currentRoundId);
      
      if (cachedRound && cacheExpiry && parseInt(cacheExpiry) > Date.now()) {
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
          const cacheData = {
            course: selectedCourse,
            holeCount: holeCount,
            holeScores: holeScores
          };
          
          try {
            // Cache for 24 hours
            const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem(ROUND_CACHE_PREFIX + currentRoundId, JSON.stringify(cacheData));
            localStorage.setItem(CACHE_EXPIRY_KEY + currentRoundId, expiryTime.toString());
            console.log(`Cached round data for ${currentRoundId}`);
          } catch (error) {
            console.error("Error caching round data:", error);
          }
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
  }, [currentRoundId, fetchRoundData, fetchTries, selectedCourse, holeCount, holeScores, setIsLoading]);
  
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
        
        // Update cache with new scores
        try {
          const cacheData = {
            course: selectedCourse,
            holeCount: holeCount,
            holeScores: updated
          };
          
          const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
          localStorage.setItem(ROUND_CACHE_PREFIX + currentRoundId, JSON.stringify(cacheData));
          localStorage.setItem(CACHE_EXPIRY_KEY + currentRoundId, expiryTime.toString());
        } catch (error) {
          console.error("Error updating cache with new score:", error);
        }
        
        return updated;
      });
    }
    
    return success;
  };
  
  const finishRound = async () => {
    const result = await finishRoundOperation(currentRoundId);
    
    if (result) {
      // Clear cache on successful finish
      try {
        localStorage.removeItem(ROUND_CACHE_PREFIX + currentRoundId);
        localStorage.removeItem(CACHE_EXPIRY_KEY + currentRoundId);
      } catch (error) {
        console.error("Error clearing cache on round finish:", error);
      }
    }
    
    return result;
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
