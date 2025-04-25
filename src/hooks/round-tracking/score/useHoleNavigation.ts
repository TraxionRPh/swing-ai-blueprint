
import { useState } from "react";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);

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
