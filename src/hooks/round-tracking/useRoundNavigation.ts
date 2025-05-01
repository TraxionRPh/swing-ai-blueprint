
import { useState, useCallback, useEffect } from "react";

interface HoleNavigationProps {
  holeCount?: number;
  initialHole?: number;
  onHoleChange?: (holeNumber: number) => void;
}

export const useRoundNavigation = ({
  holeCount = 18,
  initialHole = 1,
  onHoleChange
}: HoleNavigationProps = {}) => {
  const [currentHole, setCurrentHole] = useState(initialHole);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Initialize with stored hole number if available
  useEffect(() => {
    const resumeHole = sessionStorage.getItem('resume-hole-number');
    if (resumeHole) {
      const holeNum = Number(resumeHole);
      if (!isNaN(holeNum) && holeNum >= 1 && holeNum <= holeCount) {
        console.log(`Resuming at hole ${holeNum}`);
        setCurrentHole(holeNum);
      }
    }
  }, [holeCount]);
  
  // Update session storage when current hole changes
  useEffect(() => {
    if (currentHole >= 1 && currentHole <= holeCount) {
      sessionStorage.setItem('resume-hole-number', currentHole.toString());
      
      if (onHoleChange) {
        onHoleChange(currentHole);
      }
    }
  }, [currentHole, holeCount, onHoleChange]);
  
  // Handle navigation to the next hole
  const handleNext = useCallback(() => {
    if (isNavigating || currentHole >= holeCount) return;
    
    setIsNavigating(true);
    console.log(`Navigating from hole ${currentHole} to ${currentHole + 1}`);
    
    setCurrentHole(prev => {
      const nextHole = prev + 1;
      return nextHole <= holeCount ? nextHole : prev;
    });
    
    setTimeout(() => setIsNavigating(false), 300);
  }, [currentHole, holeCount, isNavigating]);
  
  // Handle navigation to the previous hole
  const handlePrevious = useCallback(() => {
    if (isNavigating || currentHole <= 1) return;
    
    setIsNavigating(true);
    console.log(`Navigating from hole ${currentHole} to ${currentHole - 1}`);
    
    setCurrentHole(prev => {
      const prevHole = prev - 1;
      return prevHole >= 1 ? prevHole : prev;
    });
    
    setTimeout(() => setIsNavigating(false), 300);
  }, [currentHole, isNavigating]);
  
  // Handle direct navigation to a specific hole
  const navigateToHole = useCallback((holeNumber: number) => {
    if (isNavigating || holeNumber < 1 || holeNumber > holeCount) return;
    
    setIsNavigating(true);
    console.log(`Directly navigating to hole ${holeNumber}`);
    
    setCurrentHole(holeNumber);
    
    setTimeout(() => setIsNavigating(false), 300);
  }, [holeCount, isNavigating]);
  
  // Clear any resume data
  const clearResumeData = useCallback(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    console.log("Resume data cleared");
  }, []);
  
  return {
    currentHole,
    setCurrentHole: navigateToHole,
    handleNext,
    handlePrevious,
    navigateToHole,
    isNavigating,
    clearResumeData
  };
};
