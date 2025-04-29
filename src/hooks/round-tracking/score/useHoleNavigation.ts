
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useResumeSession } from "./use-resume-session";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const { holeNumber } = useParams();
  const { savedHoleNumber, clearResumeData } = useResumeSession();
  
  // Initialize the hole number immediately
  useEffect(() => {
    let initialHole = 1;
    
    // First priority: Check for resume data from session
    if (savedHoleNumber !== null) {
      console.log(`Resuming round at saved hole: ${savedHoleNumber}`);
      initialHole = savedHoleNumber;
      clearResumeData();
    } 
    // Next check URL params
    else if (holeNumber && !isNaN(Number(holeNumber))) {
      initialHole = Number(holeNumber);
      console.log("Using hole number from URL:", initialHole);
    }
    // Next check sessionStorage directly
    else {
      const resumeHoleNumber = sessionStorage.getItem('resume-hole-number');
      if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber))) {
        initialHole = Number(resumeHoleNumber);
        sessionStorage.removeItem('resume-hole-number');
        console.log("Resuming from sessionStorage at hole:", initialHole);
      } else {
        const localStorageHoleNumber = localStorage.getItem('resume-hole-number');
        if (localStorageHoleNumber && !isNaN(Number(localStorageHoleNumber))) {
          initialHole = Number(localStorageHoleNumber);
          localStorage.removeItem('resume-hole-number');
          console.log("Resuming from localStorage at hole:", initialHole);
        }
      }
    }
    
    console.log("Setting initial hole to:", initialHole);
    setCurrentHole(initialHole);
  }, [holeNumber, savedHoleNumber, clearResumeData]);

  const handleNext = () => {
    if (currentHole < 18) {
      setCurrentHole(prev => {
        const nextHole = prev + 1;
        console.log(`Moving to next hole: ${nextHole}`);
        return nextHole;
      });
    }
  };

  const handlePrevious = () => {
    if (currentHole > 1) {
      setCurrentHole(prev => {
        const prevHole = prev - 1;
        console.log(`Moving to previous hole: ${prevHole}`);
        return prevHole;
      });
    }
  };

  return {
    currentHole,
    setCurrentHole,
    handleNext,
    handlePrevious
  };
};
