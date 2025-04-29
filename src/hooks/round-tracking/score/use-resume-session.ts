
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
      
      try {
        // Get data from storage
        const sessionHoleNumber = sessionStorage.getItem('resume-hole-number');
        const localHoleNumber = localStorage.getItem('resume-hole-number');
        
        // Process resume data if available
        if (sessionHoleNumber && isMounted.current) {
          console.log("Found resume hole in sessionStorage:", sessionHoleNumber);
          const parsedHole = parseInt(sessionHoleNumber, 10);
          if (!isNaN(parsedHole)) {
            setSavedHoleNumber(parsedHole);
            return;
          }
        }
        
        if (localHoleNumber && isMounted.current) {
          console.log("Found resume hole in localStorage:", localHoleNumber);
          const parsedHole = parseInt(localHoleNumber, 10);
          if (!isNaN(parsedHole)) {
            setSavedHoleNumber(parsedHole);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking resume data:", error);
        // Continue without resume data
      }
    };
    
    // Check immediately on mount - no delay
    checkForResumeData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array, run once on mount

  // Function to clear resume data
  const clearResumeData = () => {
    try {
      sessionStorage.removeItem('resume-hole-number');
      localStorage.removeItem('resume-hole-number');
      if (isMounted.current) {
        setSavedHoleNumber(null);
        console.log("Cleared resume hole data");
      }
    } catch (error) {
      console.error("Error clearing resume data:", error);
    }
  };

  // Function to save current hole for resuming
  const saveCurrentHole = (holeNumber: number) => {
    try {
      sessionStorage.setItem('resume-hole-number', holeNumber.toString());
      localStorage.setItem('resume-hole-number', holeNumber.toString());
      if (isMounted.current) {
        setSavedHoleNumber(holeNumber);
        console.log("Saved hole", holeNumber, "for resuming");
      }
    } catch (error) {
      console.error("Error saving current hole:", error);
    }
  };

  return { 
    savedHoleNumber, 
    clearResumeData,
    saveCurrentHole
  };
};
