
import { useState, useEffect } from "react";

/**
 * Hook for detecting the hole count from URL and session storage
 */
export const useHoleCountDetection = () => {
  const [holeCount, setHoleCount] = useState(18);
  
  useEffect(() => {
    // Get the current path
    const path = window.location.pathname;
    console.log(`useHoleCountDetection - Analyzing path: ${path}`);
    
    // Explicit path pattern matching for 9-hole rounds
    const is9HolePattern = /\/rounds\/new\/9($|\/)|\/9\//;
    const is9HoleRound = is9HolePattern.test(path);
    
    // Explicit path pattern matching for 18-hole rounds
    const is18HolePattern = /\/rounds\/new\/18($|\/)|\/18\//;
    const is18HoleRound = is18HolePattern.test(path);
    
    // Get stored hole count
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    
    console.log(`Path detection results:`);
    console.log(`- Is 9-hole round from path? ${is9HoleRound}`);
    console.log(`- Is 18-hole round from path? ${is18HoleRound}`);
    console.log(`- Stored hole count: ${storedHoleCount}`);
    
    // Priority 1: URL path takes precedence over everything else
    if (is9HoleRound) {
      console.log("Setting hole count to 9 from URL path detection");
      setHoleCount(9);
      // Update session storage to match path
      sessionStorage.setItem('current-hole-count', '9');
    } else if (is18HolePattern.test(path)) {
      console.log("Setting hole count to 18 from URL path detection");
      setHoleCount(18);
      // Update session storage to match path
      sessionStorage.setItem('current-hole-count', '18');
    } 
    // Priority 2: Session storage if URL doesn't specify
    else if (storedHoleCount) {
      const parsedCount = parseInt(storedHoleCount, 10);
      if (parsedCount === 9 || parsedCount === 18) { // Validate it's a valid hole count
        console.log(`Using hole count ${parsedCount} from session storage`);
        setHoleCount(parsedCount);
      } else {
        // Reset to default if invalid value
        console.log(`Invalid hole count in storage: ${parsedCount}, defaulting to 18`);
        setHoleCount(18);
        sessionStorage.setItem('current-hole-count', '18');
      }
    } 
    // Priority 3: Default to 18 if nothing else is specified
    else {
      console.log("No hole count detected, defaulting to 18");
      setHoleCount(18);
      sessionStorage.setItem('current-hole-count', '18');
    }
  }, []);
  
  // Function to explicitly update hole count
  const updateHoleCount = (count: number) => {
    if (count !== 9 && count !== 18) {
      console.error(`Invalid hole count: ${count}. Must be 9 or 18.`);
      return;
    }
    
    console.log(`Explicitly updating hole count to ${count}`);
    setHoleCount(count);
    sessionStorage.setItem('current-hole-count', count.toString());
  };

  return { 
    holeCount, 
    setHoleCount: updateHoleCount 
  };
};
