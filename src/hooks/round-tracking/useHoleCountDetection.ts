
import { useState, useEffect, useCallback } from "react";

/**
 * Hook for detecting the hole count from URL and session storage
 * with improved reliability and URL change detection
 */
export const useHoleCountDetection = () => {
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  
  // Analyze the URL to determine hole count with better pattern detection
  const detectHoleCountFromUrl = useCallback(() => {
    // Get the current path
    const path = window.location.pathname;
    console.log(`useHoleCountDetection - Analyzing path: ${path}`);
    
    // Improved path pattern matching for 9-hole rounds - check for exact matches
    const is9HolePattern = /\/rounds\/new\/9($|\/)|\/(rounds\/)[^\/]+\/9($|\/)/;
    const is9HoleRound = is9HolePattern.test(path);
    
    // Improved path pattern matching for 18-hole rounds - check for exact matches
    const is18HolePattern = /\/rounds\/new\/18($|\/)|\/(rounds\/)[^\/]+\/18($|\/)/;
    const is18HoleRound = is18HolePattern.test(path);
    
    // Get stored hole count
    const storedHoleCount = sessionStorage.getItem('current-hole-count');
    
    console.log(`Path detection results:`);
    console.log(`- Is 9-hole round from path? ${is9HoleRound}`);
    console.log(`- Is 18-hole round from path? ${is18HoleRound}`);
    console.log(`- Stored hole count: ${storedHoleCount}`);
    
    // Enhanced path detection to determine if we're in a 9 or 18 hole path
    if (path.includes('/rounds/new/9') || path.endsWith('/9')) {
      console.log("Setting hole count to 9 from EXACT URL path match");
      setHoleCount(9);
      // Update session storage to match path
      sessionStorage.setItem('current-hole-count', '9');
      return 9;
    } else if (path.includes('/rounds/new/18') || path.endsWith('/18')) {
      console.log("Setting hole count to 18 from EXACT URL path match");
      setHoleCount(18);
      // Update session storage to match path
      sessionStorage.setItem('current-hole-count', '18');
      return 18;
    }
    // Priority 1: URL path detection with improved patterns
    else if (is9HoleRound) {
      console.log("Setting hole count to 9 from URL path pattern detection");
      setHoleCount(9);
      // Update session storage to match path
      sessionStorage.setItem('current-hole-count', '9');
      return 9;
    } else if (is18HoleRound) {
      console.log("Setting hole count to 18 from URL path pattern detection");
      setHoleCount(18);
      // Update session storage to match path
      sessionStorage.setItem('current-hole-count', '18');
      return 18;
    } 
    // Priority 2: Session storage if URL doesn't specify
    else if (storedHoleCount) {
      const parsedCount = parseInt(storedHoleCount, 10);
      if (parsedCount === 9) {
        console.log(`Using hole count 9 from session storage`);
        setHoleCount(9);
        return 9;
      } else if (parsedCount === 18) {
        console.log(`Using hole count 18 from session storage`);
        setHoleCount(18);
        return 18;
      } else {
        // Reset to default if invalid value
        console.log(`Invalid hole count in storage: ${parsedCount}, defaulting to 18`);
        setHoleCount(18);
        sessionStorage.setItem('current-hole-count', '18');
        return 18;
      }
    } 
    // Priority 3: Default to 18 if nothing else is specified
    else {
      console.log("No hole count detected, defaulting to 18");
      setHoleCount(18);
      sessionStorage.setItem('current-hole-count', '18');
      return 18;
    }
  }, []);
  
  // Run detection on mount and when URL changes
  useEffect(() => {
    // Initial detection
    const detectedCount = detectHoleCountFromUrl();
    console.log(`Initial hole count detection: ${detectedCount}`);
    
    // Set up listener for URL changes via both popstate and pushState/replaceState
    const handleUrlChange = () => {
      console.log("URL changed, re-detecting hole count");
      detectHoleCountFromUrl();
    };
    
    // Listen for url changes via popstate
    window.addEventListener('popstate', handleUrlChange);
    
    // Override history methods to detect programmatic navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function() {
      originalPushState.apply(this, arguments);
      handleUrlChange();
    };
    
    window.history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      handleUrlChange();
    };
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [detectHoleCountFromUrl]);
  
  // Function to explicitly update hole count with validation
  const updateHoleCount = useCallback((count: number) => {
    if (count !== 9 && count !== 18) {
      console.error(`Invalid hole count: ${count}. Must be 9 or 18.`);
      return;
    }
    
    console.log(`Explicitly updating hole count to ${count}`);
    setHoleCount(count as 9 | 18);
    sessionStorage.setItem('current-hole-count', count.toString());
  }, []);
  
  // Function to clean up hole count data
  const cleanupHoleCount = useCallback(() => {
    console.log("Cleaning up hole count data");
    sessionStorage.removeItem('current-hole-count');
  }, []);

  return { 
    holeCount, 
    setHoleCount: updateHoleCount,
    detectHoleCountFromUrl,
    cleanupHoleCount
  };
};
