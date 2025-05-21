
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface ResumeSessionProps {
  currentHole: number;
  holeCount: number | null;
  roundId: string | null;
}

export const useResumeSession = ({ currentHole, holeCount, roundId }: ResumeSessionProps) => {
  const hasInitialized = useRef(false);
  const hasResumed = useRef(false);
  const [resumeHole, setResumeHole] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Check for forced resume
  useEffect(() => {
    const forceResume = sessionStorage.getItem('force-resume');
    if (forceResume === 'true' && roundId && !hasResumed.current) {
      console.log("Force resume detected for round:", roundId);
      const resumeHoleNumber = getResumeHole();
      
      if (resumeHoleNumber) {
        setResumeHole(resumeHoleNumber);
        toast({
          title: "Resuming round",
          description: `Continuing from hole ${resumeHoleNumber}`
        });
      }
      
      // Clear the force-resume flag
      sessionStorage.removeItem('force-resume');
      hasResumed.current = true;
    }
  }, [roundId, toast]);
  
  // Store the current hole and round ID for resumption and to prevent losing progress
  useEffect(() => {
    // Only save hole when meaningfully changed and round exists
    if (roundId && currentHole > 0 && hasInitialized.current) {
      console.log(`Saving resume state for hole ${currentHole} in round ${roundId}`);
      try {
        sessionStorage.setItem('resume-hole-number', currentHole.toString());
        localStorage.setItem('resume-hole-number', currentHole.toString());
        
        // Also save the current round ID
        sessionStorage.setItem('current-round-id', roundId);
        localStorage.setItem('current-round-id', roundId);
      } catch (error) {
        console.error('Error saving resume state:', error);
      }
    } else if (roundId && currentHole > 0 && !hasInitialized.current) {
      // First initialization - still store hole as the resume point
      console.log(`Initializing resume state at hole ${currentHole} in round ${roundId}`);
      try {
        sessionStorage.setItem('resume-hole-number', currentHole.toString());
        localStorage.setItem('resume-hole-number', currentHole.toString());
        
        // Also save the current round ID
        sessionStorage.setItem('current-round-id', roundId);
        localStorage.setItem('current-round-id', roundId);
      } catch (error) {
        console.error('Error saving initial resume state:', error);
      }
    }
    
    if (!hasInitialized.current) {
      hasInitialized.current = true;
    }
  }, [currentHole, roundId]);
  
  // Clean up storage on unmount
  useEffect(() => {
    return () => {
      // Don't clear resume data if we've just resumed a round
      // This prevents clearing the data when component remounts
      if (roundId && !hasResumed.current) {
        console.log('Cleaning up resume session data');
        // We only remove from sessionStorage as localStorage serves as a backup
        // But we DO NOT remove the current-round-id to persist between sessions
        sessionStorage.removeItem('resume-hole-number');
      }
    };
  }, [roundId]);
  
  const getResumeHole = useCallback((): number | null => {
    try {
      // First check for force-resume flag (highest priority)
      const forceResume = sessionStorage.getItem('force-resume');
      if (forceResume === 'true') {
        console.log("Force resume detected, checking for resume hole");
      }
      
      // First try session storage (primary)
      const sessionHole = sessionStorage.getItem('resume-hole-number');
      if (sessionHole && !isNaN(Number(sessionHole))) {
        const holeNum = Number(sessionHole);
        if (holeNum >= 1 && holeNum <= (holeCount || 18)) {
          console.log(`Found resume hole in sessionStorage: ${holeNum}`);
          return holeNum;
        }
      }
      
      // Fall back to localStorage
      const localHole = localStorage.getItem('resume-hole-number');
      if (localHole && !isNaN(Number(localHole))) {
        const holeNum = Number(localHole);
        if (holeNum >= 1 && holeNum <= (holeCount || 18)) {
          console.log(`Found resume hole in localStorage: ${holeNum}`);
          return holeNum;
        }
      }
    } catch (error) {
      console.error('Error reading resume hole:', error);
    }
    
    return null;
  }, [holeCount]);
  
  // Get the saved round ID
  const getSavedRoundId = useCallback((): string | null => {
    try {
      // First try session storage
      const sessionRoundId = sessionStorage.getItem('current-round-id');
      if (sessionRoundId) {
        console.log(`Found round ID in sessionStorage: ${sessionRoundId}`);
        return sessionRoundId;
      }
      
      // Fall back to localStorage
      const localRoundId = localStorage.getItem('current-round-id');
      if (localRoundId) {
        console.log(`Found round ID in localStorage: ${localRoundId}`);
        return localRoundId;
      }
    } catch (error) {
      console.error('Error reading saved round ID:', error);
    }
    
    return null;
  }, []);

  const clearResumeData = useCallback(() => {
    console.log('Manually clearing resume data');
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    // Don't clear current-round-id as we want to maintain session persistence
    hasResumed.current = false;
  }, []);
  
  return { 
    getResumeHole, 
    resumeHole,
    clearResumeData,
    getSavedRoundId,
    hasResumed: hasResumed.current
  };
};
