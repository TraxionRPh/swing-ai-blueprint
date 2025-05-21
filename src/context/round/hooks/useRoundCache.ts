
import { useState, useEffect } from "react";
import { Course, HoleData } from "@/types/round-tracking";

// Cache key constants
const ROUND_CACHE_PREFIX = "cached-round-";
const CACHE_EXPIRY_KEY = "cache-expiry-";

export const useRoundCache = (
  currentRoundId: string | null,
  selectedCourse: Course | null,
  holeCount: number,
  holeScores: HoleData[]
) => {
  // Load from cache
  const loadFromCache = (roundId: string) => {
    try {
      const cachedRound = localStorage.getItem(ROUND_CACHE_PREFIX + roundId);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY + roundId);
      
      if (cachedRound && cacheExpiry) {
        const expiryTime = parseInt(cacheExpiry);
        
        // If cache hasn't expired (1 day = 86400000 ms)
        if (expiryTime > Date.now()) {
          console.log(`Using cached data for round ${roundId}`);
          try {
            return JSON.parse(cachedRound);
          } catch (parseError) {
            console.error("Error parsing cached round data:", parseError);
          }
        } else {
          // Cache expired, remove it
          localStorage.removeItem(ROUND_CACHE_PREFIX + roundId);
          localStorage.removeItem(CACHE_EXPIRY_KEY + roundId);
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
    return null;
  };

  // Save to cache
  const saveToCache = (roundId: string) => {
    if (!roundId || roundId === 'new') return;
    
    try {
      const cacheData = {
        course: selectedCourse,
        holeCount: holeCount,
        holeScores: holeScores
      };
      
      // Cache for 24 hours
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem(ROUND_CACHE_PREFIX + roundId, JSON.stringify(cacheData));
      localStorage.setItem(CACHE_EXPIRY_KEY + roundId, expiryTime.toString());
      console.log(`Cached round data for ${roundId}`);
    } catch (error) {
      console.error("Error caching round data:", error);
    }
  };

  // Clear cache
  const clearCache = (roundId: string) => {
    if (!roundId) return;
    
    try {
      localStorage.removeItem(ROUND_CACHE_PREFIX + roundId);
      localStorage.removeItem(CACHE_EXPIRY_KEY + roundId);
      console.log(`Cleared cache for round ${roundId}`);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  // Save current round ID to storage
  const saveRoundIdToStorage = (roundId: string | null) => {
    if (!roundId) return;
    
    try {
      // Store in both session and local storage for better persistence
      sessionStorage.setItem('current-round-id', roundId);
      localStorage.setItem('current-round-id', roundId);
      console.log(`Saved currentRoundId to storage: ${roundId}`);
    } catch (error) {
      console.error('Error saving round ID to storage:', error);
    }
  };

  // Load round ID from storage
  const loadRoundIdFromStorage = () => {
    try {
      // First check if we're in the middle of a page reload for the same round
      let savedRoundId = sessionStorage.getItem('current-round-id');
      
      // If not in session storage, try local storage (for returning users)
      if (!savedRoundId || savedRoundId === 'new') {
        savedRoundId = localStorage.getItem('current-round-id');
      }
      
      return savedRoundId;
    } catch (error) {
      console.error('Error retrieving round ID from storage:', error);
      return null;
    }
  };

  return {
    loadFromCache,
    saveToCache,
    clearCache,
    saveRoundIdToStorage,
    loadRoundIdFromStorage
  };
};
