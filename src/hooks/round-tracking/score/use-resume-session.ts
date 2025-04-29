
import { useEffect, useState, useRef } from "react";

export const useResumeSession = () => {
  const [savedHoleNumber, setSavedHoleNumber] = useState<number | null>(null);
  const hasCheckedRef = useRef(false);
  
  // Check for resume data in sessionStorage and localStorage - only once
  useEffect(() => {
    // Skip if we've already checked
    if (hasCheckedRef.current) return;
    
    // Mark as checked immediately
    hasCheckedRef.current = true;
    
    const checkForResumeData = () => {
      const sessionHoleNumber = sessionStorage.getItem('resume-hole-number');
      const localHoleNumber = localStorage.getItem('resume-hole-number');
      
      if (sessionHoleNumber) {
        console.log("Found resume hole in sessionStorage:", sessionHoleNumber);
        setSavedHoleNumber(parseInt(sessionHoleNumber, 10));
        return;
      }
      
      if (localHoleNumber) {
        console.log("Found resume hole in localStorage:", localHoleNumber);
        setSavedHoleNumber(parseInt(localHoleNumber, 10));
        return;
      }
    };
    
    // Check immediately on mount - no delay
    checkForResumeData();
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
    clearResumeData,
    saveCurrentHole
  };
};
