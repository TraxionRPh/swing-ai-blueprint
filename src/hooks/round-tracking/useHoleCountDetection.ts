
import { useState, useEffect } from "react";

/**
 * Hook for detecting the hole count from URL and session storage
 */
export const useHoleCountDetection = () => {
  const [holeCount, setHoleCount] = useState(18);
  
  useEffect(() => {
    // More precise pattern matching for path detection
    const path = window.location.pathname;
    
    // Check if the path explicitly matches /rounds/new/9 or contains /9/ 
    // with strict boundary checks to avoid matching numbers like 19
    const is9HolePattern = /\/rounds\/new\/9($|\/)|\/9\//;
    const is9HoleRound = is9HolePattern.test(path);
    
    // Check if the path explicitly matches /rounds/new/18 or contains /18/
    // with strict boundary checks
    const is18HolePattern = /\/rounds\/new\/18($|\/)|\/18\//;
    const is18HoleRound = is18HolePattern.test(path);
    
    // Get stored hole count
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    
    console.log(`Path detection - path: ${path}`);
    console.log(`Is 9-hole round from path? ${is9HoleRound}`);
    console.log(`Is 18-hole round from path? ${is18HoleRound}`);
    console.log(`Stored hole count: ${storedHoleCount}`);
    
    if (is9HoleRound) {
      console.log("Setting hole count to 9 from URL path detection");
      setHoleCount(9);
      // Ensure session storage is updated
      sessionStorage.setItem('current-hole-count', '9');
    } else if (is18HoleRound) {
      console.log("Setting hole count to 18 from URL path detection");
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
    console.log(`Explicitly updating hole count to ${count}`);
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  };

  return { 
    holeCount, 
    setHoleCount: updateHoleCount 
  };
};
