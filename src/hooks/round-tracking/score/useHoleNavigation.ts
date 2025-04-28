
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const { holeNumber } = useParams();
  
  useEffect(() => {
    // First priority: If a specific hole is specified in the URL, use that
    if (holeNumber && !isNaN(Number(holeNumber))) {
      setCurrentHole(Number(holeNumber));
      return;
    }
    
    // Second priority: Check if we're resuming a round
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number');
    if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber))) {
      const holeNum = Number(resumeHoleNumber);
      // Ensure the hole number is valid (between 1 and 18)
      if (holeNum >= 1 && holeNum <= 18) {
        console.log("Resuming round at hole:", holeNum);
        setCurrentHole(holeNum);
        // Clear the session storage after use to prevent it affecting future rounds
        sessionStorage.removeItem('resume-hole-number');
        return;
      }
    }
    
    // Default to hole 1 if no specific instructions
    setCurrentHole(1);
  }, [holeNumber]);

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
