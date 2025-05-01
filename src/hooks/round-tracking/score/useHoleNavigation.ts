
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const { roundId, holeNumber } = useParams();
  const navigate = useNavigate();
  const didInitialize = useRef(false);
  const lastNavigation = useRef<number>(0);
  
  // Initialize the hole number with improved logging
  useEffect(() => {
    if (didInitialize.current) return;
    
    // Mark as initialized to prevent multiple runs
    didInitialize.current = true;
    
    console.log("Initializing hole navigation, URL param:", holeNumber);
    
    // Handle URL param if provided (highest priority)
    if (holeNumber && !isNaN(Number(holeNumber))) {
      console.log("Using hole number from URL:", holeNumber);
      setCurrentHole(Number(holeNumber));
      return;
    }
    
    // Check for resume data in session storage (second priority)
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number');
    if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber))) {
      console.log("Using hole number from session storage:", resumeHoleNumber);
      setCurrentHole(Number(resumeHoleNumber));
      return;
    }
    
    // Default to hole 1 if no specific instructions
    console.log("No hole number in URL or session, defaulting to hole 1");
    setCurrentHole(1);
  }, [holeNumber]);

  const handleNext = useCallback(() => {
    // Prevent multiple rapid navigation requests
    const now = Date.now();
    if (now - lastNavigation.current < 500) {
      console.log("Navigation throttled - too soon after last navigation");
      return;
    }
    lastNavigation.current = now;
    
    if (currentHole < 18) {
      const nextHole = currentHole + 1;
      console.log(`Moving to next hole: ${nextHole}`);
      
      // Update the session storage for resume capability
      sessionStorage.setItem('resume-hole-number', nextHole.toString());
      
      // Update the URL to reflect the new hole number
      if (roundId) {
        console.log(`Navigating to /rounds/${roundId}/${nextHole}`);
        navigate(`/rounds/${roundId}/${nextHole}`, { replace: true });
      }
      
      // Also update the state to ensure instant UI updates
      setCurrentHole(nextHole);
    }
  }, [currentHole, navigate, roundId]);

  const handlePrevious = useCallback(() => {
    // Prevent multiple rapid navigation requests
    const now = Date.now();
    if (now - lastNavigation.current < 500) {
      console.log("Navigation throttled - too soon after last navigation");
      return;
    }
    lastNavigation.current = now;
    
    if (currentHole > 1) {
      const prevHole = currentHole - 1;
      console.log(`Moving to previous hole: ${prevHole}`);
      
      // Update the session storage for resume capability
      sessionStorage.setItem('resume-hole-number', prevHole.toString());
      
      // Update the URL to reflect the new hole number
      if (roundId) {
        console.log(`Navigating to /rounds/${roundId}/${prevHole}`);
        navigate(`/rounds/${roundId}/${prevHole}`, { replace: true });
      }
      
      // Also update the state to ensure instant UI updates
      setCurrentHole(prevHole);
    }
  }, [currentHole, navigate, roundId]);
  
  // Add ability to set hole directly
  const setHole = useCallback((holeNumber: number) => {
    if (holeNumber >= 1 && holeNumber <= 18) {
      console.log(`Directly setting hole to: ${holeNumber}`);
      
      // Update the session storage for resume capability
      sessionStorage.setItem('resume-hole-number', holeNumber.toString());
      
      // Update the URL to reflect the new hole number
      if (roundId) {
        navigate(`/rounds/${roundId}/${holeNumber}`, { replace: true });
      }
      
      // Update the state with the new hole number
      setCurrentHole(holeNumber);
    } else {
      console.warn(`Invalid hole number: ${holeNumber}, must be between 1 and 18`);
    }
  }, [navigate, roundId]);

  return {
    currentHole,
    setCurrentHole: setHole,
    handleNext,
    handlePrevious
  };
};
