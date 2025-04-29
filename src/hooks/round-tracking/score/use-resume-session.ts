
import { useEffect, useState } from "react";

export const useResumeSession = () => {
  const [savedHoleNumber, setSavedHoleNumber] = useState<number | null>(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  
  // Check for resume data in sessionStorage and localStorage
  useEffect(() => {
    const checkForResumeData = () => {
      // Always clear the loading state after checking
      setHasCheckedStorage(true);
      
      const sessionHoleNumber = sessionStorage.getItem('resume-hole-number');
      const localHoleNumber = localStorage.getItem('resume-hole-number');
      
      if (sessionHoleNumber) {
        const holeNum = parseInt(sessionHoleNumber, 10);
        console.log("Found resume hole in sessionStorage:", holeNum);
        setSavedHoleNumber(holeNum);
        return holeNum;
      }
      
      if (localHoleNumber) {
        const holeNum = parseInt(localHoleNumber, 10);
        console.log("Found resume hole in localStorage:", localHoleNumber);
        setSavedHoleNumber(holeNum);
        return holeNum;
      }
      
      return null;
    };
    
    // Run immediately to prevent any delay in initialization
    checkForResumeData();
    
    // No need for the delayed check anymore as it can cause race conditions
    // Just ensure we've marked as checked
    console.log("Resume session initialized, hasCheckedStorage:", true);
  }, []);

  // Function to clear resume data
  const clearResumeData = () => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    setSavedHoleNumber(null);
    console.log("Cleared resume hole data");
  };

  // Function to save current hole for resuming
  const saveCurrentHole = (holeNumber: number) => {
    sessionStorage.setItem('resume-hole-number', holeNumber.toString());
    localStorage.setItem('resume-hole-number', holeNumber.toString());
    setSavedHoleNumber(holeNumber);
    console.log("Saved hole", holeNumber, "for resuming");
  };

  return { 
    savedHoleNumber, 
    hasCheckedStorage: true, // Always return true to prevent initialization delays
    clearResumeData,
    saveCurrentHole
  };
};
