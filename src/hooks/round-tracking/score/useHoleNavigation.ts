
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
    
    // Handle URL param if provided (highest priority)
    if (holeNumber && !isNaN(Number(holeNumber))) {
      console.log("Using hole number from URL:", holeNumber);
      setCurrentHole(Number(holeNumber));
      return;
    }
    
    // Default to hole 1 if no specific instructions
    console.log("No hole number in URL, defaulting to hole 1");
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
    } else {
      console.warn(`Invalid hole number: ${holeNumber}, must be between 1 and 18`);
    }
  }, []);

  return {
    currentHole,
    setCurrentHole: setHole,
    handleNext,
    handlePrevious
  };
};
