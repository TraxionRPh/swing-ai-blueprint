
import { useState, useEffect } from "react";

/**
 * Hook for detecting the hole count from URL and session storage
 */
export const useHoleCountDetection = () => {
  const [holeCount, setHoleCount] = useState(18);
  
  useEffect(() => {
    // First check URL for hole count indicators (highest priority)
    const is9HoleRound = window.location.pathname.includes('/rounds/new/9');
    const is18HoleRound = window.location.pathname.includes('/rounds/new/18');
    
    // Then check if hole count is in session storage
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    
    if (is9HoleRound) {
      console.log("Detected 9-hole round from URL: /rounds/new/9");
      setHoleCount(9);
      // Ensure session storage is updated
      sessionStorage.setItem('current-hole-count', '9');
    } else if (is18HoleRound) {
      console.log("Detected 18-hole round from URL: /rounds/new/18");
      setHoleCount(18);
      // Ensure session storage is updated
      sessionStorage.setItem('current-hole-count', '18');
    } else if (storedHoleCount) {
      // Use stored value if available and no explicit URL indicator
      const parsedCount = parseInt(storedHoleCount, 10);
      console.log(`Using hole count ${parsedCount} from session storage`);
      setHoleCount(parsedCount);
    } else {
      // Default to 18 holes if nothing else is specified
      console.log("No hole count detected, defaulting to 18");
      setHoleCount(18);
      sessionStorage.setItem('current-hole-count', '18');
    }
  }, []);
  
  const updateHoleCount = (count: number) => {
    console.log(`Updating hole count to ${count}`);
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  };

  return { 
    holeCount, 
    setHoleCount: updateHoleCount 
  };
};
