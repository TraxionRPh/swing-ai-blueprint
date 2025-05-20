
import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * Hook for managing hole navigation with improved hole count handling
 */
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
    // Get the current hole count from session storage - with validation
    const holeCountStr = sessionStorage.getItem('current-hole-count');
    const parsedCount = holeCountStr ? parseInt(holeCountStr, 10) : null;
    const maxHoles = (parsedCount === 9 || parsedCount === 18) ? parsedCount : 18;
    
    console.log(`handleNext: Current hole ${currentHole}, max holes ${maxHoles}`);
    
    if (currentHole < maxHoles) {
      const nextHole = currentHole + 1;
      console.log(`Moving to next hole: ${nextHole} (max: ${maxHoles})`);
      
      // Update the session storage for resume capability
      sessionStorage.setItem('resume-hole-number', nextHole.toString());
      
      // Update the URL to reflect the new hole number
      if (roundId) {
        navigate(`/rounds/${roundId}/${nextHole}`);
      }
      
      // Also update the state to ensure instant UI updates
      setCurrentHole(nextHole);
    } else {
      console.log(`Already at max hole (${currentHole}/${maxHoles}), not advancing`);
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
    } else {
      console.log("Already at first hole, not going back");
    }
  }, [currentHole, navigate, roundId]);
  
  // Add ability to set hole directly with validation
  const setHole = useCallback((holeNumber: number) => {
    // Get the current hole count from session storage with validation
    const holeCountStr = sessionStorage.getItem('current-hole-count');
    const parsedCount = holeCountStr ? parseInt(holeCountStr, 10) : null;
    const maxHoles = (parsedCount === 9 || parsedCount === 18) ? parsedCount : 18;
    
    if (holeNumber >= 1 && holeNumber <= maxHoles) {
      console.log(`Directly setting hole to: ${holeNumber} (max: ${maxHoles})`);
      
      // Update the session storage for resume capability
      sessionStorage.setItem('resume-hole-number', holeNumber.toString());
      
      // Update the URL to reflect the new hole number
      if (roundId) {
        navigate(`/rounds/${roundId}/${holeNumber}`);
      }
      
      // Update the state with the new hole number
      setCurrentHole(holeNumber);
    } else {
      console.warn(`Invalid hole number: ${holeNumber}, must be between 1 and ${maxHoles}`);
    }
  }, [navigate, roundId]);

  // Function to clear resume data from storage
  const clearResumeData = useCallback(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    sessionStorage.removeItem('force-new-round');
    console.log("Resume data cleared");
  }, []);

  return {
    currentHole,
    setCurrentHole: setHole,
    handleNext,
    handlePrevious,
    clearResumeData
  };
};
