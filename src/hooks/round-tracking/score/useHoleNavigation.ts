
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const useHoleNavigation = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const { roundId, holeNumber } = useParams();
  const navigate = useNavigate();
  const didInitialize = useRef(false);
  
  // Initialize the hole number with improved logging
  useEffect(() => {
    if (didInitialize.current) return;
    
    // Mark as initialized to prevent multiple runs
    didInitialize.current = true;
    
    console.log("Initializing hole navigation, URL param:", holeNumber);
    
    // Special case for new rounds - always start at hole 1
    if (roundId === 'new') {
      console.log("New round detected, starting at hole 1");
      setCurrentHole(1);
      return;
    }
    
    // Handle URL param if provided (highest priority)
    if (holeNumber && !isNaN(Number(holeNumber))) {
      console.log("Using hole number from URL:", holeNumber);
      setCurrentHole(Number(holeNumber));
      return;
    }
    
    // Check for resume data in session storage (second priority)
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number');
    if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber)) && roundId !== 'new') {
      console.log("Using hole number from session storage:", resumeHoleNumber);
      setCurrentHole(Number(resumeHoleNumber));
      return;
    }
    
    // Default to hole 1 if no specific instructions
    console.log("No hole number in URL or session, defaulting to hole 1");
    setCurrentHole(1);
  }, [holeNumber, roundId]);

  const handleNext = useCallback(() => {
    if (currentHole < 18) {
      const nextHole = currentHole + 1;
      console.log(`Moving to next hole: ${nextHole}`);
      
      // Update the session storage for resume capability
      sessionStorage.setItem('resume-hole-number', nextHole.toString());
      
      // Update the URL to reflect the new hole number
      if (roundId) {
        navigate(`/rounds/${roundId}/${nextHole}`);
      }
      
      // Also update the state to ensure instant UI updates
      setCurrentHole(nextHole);
    }
  }, [currentHole, navigate, roundId]);

  const handlePrevious = useCallback(() => {
    if (currentHole > 1) {
      const prevHole = currentHole - 1;
      console.log(`Moving to previous hole: ${prevHole}`);
      
      // Update the session storage for resume capability
      sessionStorage.setItem('resume-hole-number', prevHole.toString());
      
      // Update the URL to reflect the new hole number
      if (roundId) {
        navigate(`/rounds/${roundId}/${prevHole}`);
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
        navigate(`/rounds/${roundId}/${holeNumber}`);
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
