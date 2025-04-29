
import { useEffect, useState, useRef } from "react";

export const useResumeSession = () => {
  const [savedHoleNumber, setSavedHoleNumber] = useState<number | null>(null);
  const hasCheckedRef = useRef(false);
  const isMounted = useRef(true);
  
  // Check for resume data in sessionStorage and localStorage - only once
  useEffect(() => {
    // Set mounted flag
    isMounted.current = true;
    
    // Skip if we've already checked
    if (hasCheckedRef.current) return;
    
    // Mark as checked immediately
    hasCheckedRef.current = true;
    
    const checkForResumeData = () => {
      if (!isMounted.current) return;
      
      // Get data from storage
      const sessionHoleNumber = sessionStorage.getItem('resume-hole-number');
      const localHoleNumber = localStorage.getItem('resume-hole-number');
      
      // Process resume data if available
      if (sessionHoleNumber && isMounted.current) {
        console.log("Found resume hole in sessionStorage:", sessionHoleNumber);
        setSavedHoleNumber(parseInt(sessionHoleNumber, 10));
        return;
      }
      
      if (localHoleNumber && isMounted.current) {
        console.log("Found resume hole in localStorage:", localHoleNumber);
        setSavedHoleNumber(parseInt(localHoleNumber, 10));
        return;
      }
    };
    
    // Check immediately on mount - no delay
    checkForResumeData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Function to clear resume data
  const clearResumeData = () => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    if (isMounted.current) {
      setSavedHoleNumber(null);
      console.log("Cleared resume hole data");
    }
  };

  // Function to save current hole for resuming
  const saveCurrentHole = (holeNumber: number) => {
    sessionStorage.setItem('resume-hole-number', holeNumber.toString());
    localStorage.setItem('resume-hole-number', holeNumber.toString());
    if (isMounted.current) {
      setSavedHoleNumber(holeNumber);
      console.log("Saved hole", holeNumber, "for resuming");
    }
  };

  return { 
    savedHoleNumber, 
    clearResumeData,
    saveCurrentHole
  };
};
