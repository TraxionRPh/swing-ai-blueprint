
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const { holeNumber } = useParams();
  
  // Simplified callback for initializing hole number
  const initializeHole = useCallback(() => {
    // First check sessionStorage (primary method)
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number');
    if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber))) {
      const holeNum = Number(resumeHoleNumber);
      if (holeNum >= 1 && holeNum <= 18) {
        console.log("Resuming round at hole (from sessionStorage):", holeNum);
        sessionStorage.removeItem('resume-hole-number');
        return holeNum;
      }
    }
    
    // Second check localStorage as fallback
    const localStorageHoleNumber = localStorage.getItem('resume-hole-number');
    if (localStorageHoleNumber && !isNaN(Number(localStorageHoleNumber))) {
      const holeNum = Number(localStorageHoleNumber);
      if (holeNum >= 1 && holeNum <= 18) {
        console.log("Resuming round at hole (from localStorage):", holeNum);
        localStorage.removeItem('resume-hole-number');
        return holeNum;
      }
    }
    
    // Last priority: use hole from URL
    if (holeNumber && !isNaN(Number(holeNumber))) {
      return Number(holeNumber);
    }
    
    // Default to hole 1
    return 1;
  }, [holeNumber]);

  useEffect(() => {
    setCurrentHole(initializeHole());
  }, [initializeHole]);

  const handleNext = () => {
    if (currentHole < 18) {
      setCurrentHole(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentHole > 1) {
      setCurrentHole(prev => prev - 1);
    }
  };

  return {
    currentHole,
    setCurrentHole,
    handleNext,
    handlePrevious
  };
};
