
import { useEffect, useState } from "react";

/**
 * Hook to detect hole count from URL path and session storage
 */
export const useHoleCountDetection = () => {
  const [holeCount, setHoleCount] = useState(18);

  useEffect(() => {
    const detectHoleCount = () => {
      // Get the current path
      const path = window.location.pathname;
      console.log("Detecting hole count from path:", path);
      
      // First check if specific hole count in URL
      if (path.includes('/rounds/new/9')) {
        console.log("9-hole round detected from URL");
        setHoleCount(9);
        sessionStorage.setItem('current-hole-count', '9');
        return 9;
      } else if (path.includes('/rounds/new/1')) {
        // Check if this is actually a single-hole round (special case)
        const singleHoleRound = path.includes('1-hole') || sessionStorage.getItem('single-hole-round') === 'true';
        
        if (singleHoleRound) {
          console.log("Single-hole round detected");
          setHoleCount(1);
          sessionStorage.setItem('current-hole-count', '1');
          sessionStorage.setItem('single-hole-round', 'true');
          return 1; 
        } else {
          // This is just the first hole of a regular round
          console.log("Regular round, first hole");
          // Check stored hole count
          const storedHoleCount = sessionStorage.getItem('current-hole-count');
          if (storedHoleCount) {
            const count = parseInt(storedHoleCount);
            console.log(`${count}-hole round detected from session storage`);
            setHoleCount(count);
            return count;
          } else {
            // Default to 18
            console.log("No specific hole count found, defaulting to 18");
            setHoleCount(18);
            sessionStorage.setItem('current-hole-count', '18');
            return 18;
          }
        }
      } else {
        // Check stored hole count if no specific indicator in URL
        const storedHoleCount = sessionStorage.getItem('current-hole-count');
        if (storedHoleCount) {
          const count = parseInt(storedHoleCount);
          console.log(`${count}-hole round detected from session storage`);
          setHoleCount(count);
          return count;
        } else {
          // Default to 18
          console.log("No specific hole count found, defaulting to 18");
          setHoleCount(18);
          sessionStorage.setItem('current-hole-count', '18');
          return 18;
        }
      }
    };
    
    // Run the detection and log the result
    const detectedHoleCount = detectHoleCount();
    console.log("HoleCountDetection - holeCount set to:", detectedHoleCount);
  }, []);

  return { holeCount, setHoleCount };
};
