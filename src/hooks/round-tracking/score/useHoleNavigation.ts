
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useResumeSession } from "./use-resume-session";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const { holeNumber } = useParams();
  const { savedHoleNumber, clearResumeData } = useResumeSession();
  
  // Use a callback for initializing the hole number to prevent dependency issues
  const initializeHole = useCallback(() => {
    // First priority: Check for resume data from session
    if (savedHoleNumber !== null) {
      console.log(`Resuming round at saved hole: ${savedHoleNumber}`);
      // Clear resume data after using it to prevent affecting future rounds
      clearResumeData();
      return savedHoleNumber; 
    }
    
    // First check sessionStorage (primary storage method)
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number');
    if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber))) {
      const holeNum = Number(resumeHoleNumber);
      // Ensure the hole number is valid (between 1 and 18)
      if (holeNum >= 1 && holeNum <= 18) {
        console.log("Resuming round at hole (from sessionStorage):", holeNum);
        // Clear the session storage after use to prevent it affecting future rounds
        sessionStorage.removeItem('resume-hole-number');
        return holeNum;
      }
    }
    
    // Check localStorage as fallback
    const localStorageHoleNumber = localStorage.getItem('resume-hole-number');
    if (localStorageHoleNumber && !isNaN(Number(localStorageHoleNumber))) {
      const holeNum = Number(localStorageHoleNumber);
      // Ensure the hole number is valid (between 1 and 18)
      if (holeNum >= 1 && holeNum <= 18) {
        console.log("Resuming round at hole (from localStorage):", holeNum);
        // Clear the local storage after use to prevent it affecting future rounds
        localStorage.removeItem('resume-hole-number');
        return holeNum;
      }
    }
    
    // Next priority: If a specific hole is specified in the URL, use that
    if (holeNumber && !isNaN(Number(holeNumber))) {
      console.log("Using hole number from URL:", holeNumber);
      return Number(holeNumber);
    }
    
    // Default to hole 1 if no specific instructions
    console.log("No resume instructions found, defaulting to hole 1");
    return 1;
  }, [holeNumber, savedHoleNumber, clearResumeData]);

  useEffect(() => {
    const initialHole = initializeHole();
    console.log("Setting initial hole to:", initialHole);
    setCurrentHole(initialHole);
  }, [initializeHole]);

  const handleNext = () => {
    if (currentHole < 18) {
      setCurrentHole(prev => {
        const nextHole = prev + 1;
        console.log(`Moving to next hole: ${nextHole}`);
        return nextHole;
      });
    }
  };

  const handlePrevious = () => {
    if (currentHole > 1) {
      setCurrentHole(prev => {
        const prevHole = prev - 1;
        console.log(`Moving to previous hole: ${prevHole}`);
        return prevHole;
      });
    }
  };

  return {
    currentHole,
    setCurrentHole,
    handleNext,
    handlePrevious
  };
};
