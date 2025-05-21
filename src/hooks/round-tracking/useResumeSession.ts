
import { useCallback, useRef, useState } from 'react';

interface ResumeSessionProps {
  currentHole: number;
  holeCount: number | null;
  roundId: string | null;
}

export const useResumeSession = ({ currentHole, holeCount }: ResumeSessionProps) => {
  const hasInitialized = useRef(false);
  const [resumeHole, setResumeHole] = useState<number | null>(null);
  
  // Get the saved round ID from storage
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

  // Simple function to clear any resume state
  const clearResumeData = useCallback(() => {
    console.log('Clearing resume data');
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    // Don't clear current-round-id as we want to maintain session persistence
  }, []);
  
  return { 
    resumeHole,
    clearResumeData,
    getSavedRoundId,
    hasResumed: false
  };
};
