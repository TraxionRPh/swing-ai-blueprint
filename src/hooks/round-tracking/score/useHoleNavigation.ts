
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const { holeNumber } = useParams();
  
  // Use a callback for initializing the hole number to prevent dependency issues
  const initializeHole = useCallback(() => {
    // First priority: If a specific hole is specified in the URL, use that
    if (holeNumber && !isNaN(Number(holeNumber))) {
      console.log("Using hole number from URL:", holeNumber);
      return Number(holeNumber);
    }
    
    // Second priority: Check if we're resuming a round
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number');
    if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber))) {
      const holeNum = Number(resumeHoleNumber);
      // Ensure the hole number is valid (between 1 and 18)
      if (holeNum >= 1 && holeNum <= 18) {
        console.log("Resuming round at hole:", holeNum);
        // Clear the session storage after use to prevent it affecting future rounds
        sessionStorage.removeItem('resume-hole-number');
        return holeNum;
      }
    }
    
    // Default to hole 1 if no specific instructions
    return 1;
  }, [holeNumber]);

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
