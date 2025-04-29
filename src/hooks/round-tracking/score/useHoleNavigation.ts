
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const { holeNumber } = useParams();
  const didInitialize = useRef(false);
  
  // Initialize the hole number
  useEffect(() => {
    if (didInitialize.current) return;
    
    // Mark as initialized to prevent multiple runs
    didInitialize.current = true;
    
    // Check potential sources for hole number in decreasing priority
    
    // 1. Check session storage (primary storage method)
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number');
    if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber))) {
      const holeNum = Number(resumeHoleNumber);
      if (holeNum >= 1 && holeNum <= 18) {
        console.log("Resuming round at hole (from sessionStorage):", holeNum);
        // Clear the session storage after retrieval
        sessionStorage.removeItem('resume-hole-number');
        setCurrentHole(holeNum);
        return;
      }
    }
    
    // 2. Check localStorage as fallback
    const localStorageHoleNumber = localStorage.getItem('resume-hole-number');
    if (localStorageHoleNumber && !isNaN(Number(localStorageHoleNumber))) {
      const holeNum = Number(localStorageHoleNumber);
      if (holeNum >= 1 && holeNum <= 18) {
        console.log("Resuming round at hole (from localStorage):", holeNum);
        // Clear the local storage after retrieval
        localStorage.removeItem('resume-hole-number');
        setCurrentHole(holeNum);
        return;
      }
    }
    
    // 3. If a specific hole is specified in the URL, use that
    if (holeNumber && !isNaN(Number(holeNumber))) {
      console.log("Using hole number from URL:", holeNumber);
      setCurrentHole(Number(holeNumber));
      return;
    }
    
    // 4. Default to hole 1 if no specific instructions
    console.log("No resume instructions found, defaulting to hole 1");
    setCurrentHole(1);
  }, [holeNumber]);

  const handleNext = useCallback(() => {
    if (currentHole < 18) {
      setCurrentHole(prev => {
        const nextHole = prev + 1;
        console.log(`Moving to next hole: ${nextHole}`);
        return nextHole;
      });
    }
  }, [currentHole]);

  const handlePrevious = useCallback(() => {
    if (currentHole > 1) {
      setCurrentHole(prev => {
        const prevHole = prev - 1;
        console.log(`Moving to previous hole: ${prevHole}`);
        return prevHole;
      });
    }
  }, [currentHole]);
  
  // Add ability to set hole directly
  const setHole = useCallback((holeNumber: number) => {
    if (holeNumber >= 1 && holeNumber <= 18) {
      console.log(`Directly setting hole to: ${holeNumber}`);
      setCurrentHole(holeNumber);
    }
  }, []);

  return {
    currentHole,
    setCurrentHole: setHole,
    handleNext,
    handlePrevious
  };
};
