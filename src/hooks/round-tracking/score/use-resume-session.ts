
import { useEffect, useState } from "react";

export const useResumeSession = () => {
  const [savedHoleNumber, setSavedHoleNumber] = useState<number | null>(null);
  
  // Check for resume data in sessionStorage and localStorage
  useEffect(() => {
    const sessionHoleNumber = sessionStorage.getItem('resume-hole-number');
    const localHoleNumber = localStorage.getItem('resume-hole-number');
    
    if (sessionHoleNumber) {
      const holeNum = parseInt(sessionHoleNumber, 10);
      setSavedHoleNumber(holeNum);
    } else if (localHoleNumber) {
      const holeNum = parseInt(localHoleNumber, 10);
      setSavedHoleNumber(holeNum);
    }
  }, []);

  // Function to clear resume data
  const clearResumeData = () => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    setSavedHoleNumber(null);
  };

  // Function to save current hole for resuming
  const saveCurrentHole = (holeNumber: number) => {
    sessionStorage.setItem('resume-hole-number', holeNumber.toString());
    localStorage.setItem('resume-hole-number', holeNumber.toString());
    setSavedHoleNumber(holeNumber);
  };

  return { 
    savedHoleNumber, 
    hasCheckedStorage: true, // Always return true
    clearResumeData,
    saveCurrentHole
  };
};
