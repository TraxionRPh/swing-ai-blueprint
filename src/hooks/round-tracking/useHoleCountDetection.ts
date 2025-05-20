
import { useState, useEffect } from "react";

/**
 * Hook for detecting the hole count from URL and session storage
 */
export const useHoleCountDetection = () => {
  const [holeCount, setHoleCount] = useState(18);
  
  useEffect(() => {
    // First check if hole count is in session storage
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    
    // Then check URL for 9-hole indicator
    const isNineHoleRound = window.location.pathname.includes('/rounds/new/9');
    
    if (isNineHoleRound) {
      console.log("Detected 9-hole round from URL");
      setHoleCount(9);
      // Ensure session storage is updated
      sessionStorage.setItem('current-hole-count', '9');
    } else if (storedHoleCount) {
      // Use stored value if available
      const parsedCount = parseInt(storedHoleCount, 10);
      console.log(`Using hole count ${parsedCount} from session storage`);
      setHoleCount(parsedCount);
    } else {
      // Default to 18 holes
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
