
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const { holeNumber } = useParams();
  
  useEffect(() => {
    // If a specific hole is specified in the URL, use that
    if (holeNumber && !isNaN(Number(holeNumber))) {
      setCurrentHole(Number(holeNumber));
    }
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
