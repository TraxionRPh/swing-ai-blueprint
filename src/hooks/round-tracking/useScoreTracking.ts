
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { HoleData } from "@/types/round-tracking";
import { useHoleNavigation } from "./score/useHoleNavigation";
import { useHolePersistence } from "./score/use-hole-persistence";

export const useScoreTracking = (
  roundId: string | null, 
  courseId: string | undefined, 
  holeScores: HoleData[], 
  setHoleScores: (scores: HoleData[]) => void
) => {
  const { currentHole, setCurrentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { saveHoleScore, isSaving } = useHolePersistence(roundId);
  const didInitialize = useRef(false);
  
  // Check if we need to resume to a specific hole on initialization
  useEffect(() => {
    if (!didInitialize.current && roundId && holeScores.length > 0) {
      // Get resume hole from sessionStorage or localStorage
      const sessionHole = sessionStorage.getItem('resume-hole-number');
      const localHole = localStorage.getItem('resume-hole-number');
      
      const resumeHoleNumber = sessionHole || localHole;
      if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber))) {
        const holeNum = Number(resumeHoleNumber);
        if (holeNum >= 1 && holeNum <= 18) {
          console.log("Setting current hole from resume data:", holeNum);
          setCurrentHole(holeNum);
          
          // Clear storage after resuming
          sessionStorage.removeItem('resume-hole-number');
          localStorage.removeItem('resume-hole-number');
        }
      }
      
      didInitialize.current = true;
    }
  }, [roundId, holeScores, setCurrentHole]);
  
  // Create memoized current hole data
  const currentHoleData = useMemo(() => {
    // First try to find the exact hole in the scores array
    const exactHole = holeScores.find(hole => hole.holeNumber === currentHole);
    if (exactHole) return exactHole;
    
    // If not found, create default data for the current hole
    return {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
  }, [holeScores, currentHole]);

  // Handle updating a hole's score data
  const handleHoleUpdate = useCallback((data: HoleData) => {
    console.log('Updating hole data:', data);
    
    // Update the hole scores array
    const updatedScores = [...holeScores];
    const holeIndex = updatedScores.findIndex(hole => hole.holeNumber === data.holeNumber);
    
    if (holeIndex >= 0) {
      // Update existing hole
      updatedScores[holeIndex] = data;
    } else {
      // Add new hole
      updatedScores.push(data);
    }
    
    // Set the updated scores array directly
    setHoleScores(updatedScores);
    
    // Save to database if we have a valid round ID
    if (roundId) {
      saveHoleScore(data).catch(error => {
        console.error('Failed to save hole score:', error);
      });
    }
    
    // Save current hole for resumption
    if (roundId) {
      console.log(`Saving resume state for hole ${data.holeNumber} in round ${roundId}`);
      try {
        sessionStorage.setItem('resume-hole-number', data.holeNumber.toString());
        localStorage.setItem('resume-hole-number', data.holeNumber.toString());
      } catch (error) {
        console.error('Error saving resume state:', error);
      }
    }
  }, [roundId, saveHoleScore, setHoleScores, holeScores]);

  return {
    currentHole,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData
  };
};
