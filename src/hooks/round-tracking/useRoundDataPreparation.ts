
import { useEffect, useCallback, useState, useRef } from "react";
import { useRoundCourseInfo } from "./useRoundCourseInfo";
import { useRoundLoadingState } from "./useRoundLoadingState";
import { useRoundManagement } from "./useRoundManagement";
import { useRoundInitialization } from "./useRoundInitialization";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useRoundDataPreparation = (urlRoundId?: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);
  const initializationStartedRef = useRef(false);
  const isMountedRef = useRef(true);
  const previousUrlRoundIdRef = useRef<string | null | undefined>(null);
  const { isLoading, setIsLoading, loadAttempt, setLoadAttempt } = useRoundLoadingState();
  const { courseName, setCourseName, holeCount, setHoleCount } = useRoundCourseInfo();
  const { currentRoundId, setCurrentRoundId, fetchInProgressRound } = useRoundManagement(user);
  const { fetchRoundDetails } = useRoundInitialization(user, currentRoundId, setCurrentRoundId);
  
  const maxInitAttempts = 3;
  
  // Check if urlRoundId has changed significantly to warrant reinitialization
  const hasRoundIdChanged = urlRoundId !== previousUrlRoundIdRef.current;

  const initializeRound = useCallback(async () => {
    // Update ref to track current urlRoundId
    previousUrlRoundIdRef.current = urlRoundId;
    
    // Skip if we're already initialized and roundId hasn't changed
    if (initialized && !hasRoundIdChanged && initializationStartedRef.current) {
      console.log("Round data already initialized, skipping");
      return;
    }
    
    // Skip if initialization has already started and we don't have a roundId change
    if (initializationStartedRef.current && !hasRoundIdChanged) {
      console.log("Round initialization already started, skipping");
      return;
    }
    
    // Mark initialization as started
    initializationStartedRef.current = true;
    
    if (loadAttempt > maxInitAttempts) {
      console.log(`Max initialization attempts (${maxInitAttempts}) reached, stopping retries`);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    try {
      // Only set loading state if it's not already loading
      if (!isLoading && isMountedRef.current) {
        console.log("Setting loading state to true for initializeRound");
        setIsLoading(true);
      }
      
      // If roundId is provided in URL, use that instead of fetching
      if (urlRoundId) {
        console.log("Using round ID from URL:", urlRoundId);
        if (isMountedRef.current) {
          setCurrentRoundId(urlRoundId);
        }
        
        // Fetch course name and hole count for the round
        try {
          const data = await fetchRoundDetails(urlRoundId);
          
          if (data?.golf_courses?.name && isMountedRef.current) {
            setCourseName(data.golf_courses.name);
            console.log("Set course name:", data.golf_courses.name);
          }
          
          if (data?.hole_count && isMountedRef.current) {
            setHoleCount(data.hole_count);
            console.log("Set hole count:", data.hole_count);
          }
          
          if (isMountedRef.current) {
            setInitialized(true);
            setIsLoading(false);
            console.log("Round data initialized from URL roundId");
          }
        } catch (error) {
          console.error("Error fetching round details:", error);
          
          if (isMountedRef.current) {
            // Show toast only if this isn't a retry
            if (loadAttempt === 0) {
              toast({
                title: "Error loading round",
                description: "Could not load round details. Will retry automatically.",
                variant: "destructive"
              });
            }
            
            // Set retry with increasing delay to prevent hammering the server
            if (loadAttempt < maxInitAttempts) {
              setTimeout(() => {
                if (isMountedRef.current) {
                  setLoadAttempt(prev => prev + 1);
                }
              }, 1000 * (loadAttempt + 1)); // Increasing delay on each attempt
            } else {
              // Give up after max attempts
              setIsLoading(false);
              setInitialized(true); // Still mark as initialized to prevent infinite loading
            }
          }
        }
      } else {
        try {
          console.log("No roundId in URL, fetching in-progress round");
          const roundData = await fetchInProgressRound();
          
          if (roundData && isMountedRef.current) {
            setCurrentRoundId(roundData.roundId);
            setHoleCount(roundData.holeCount || 18);
            setCourseName(roundData.course?.name || null);
            console.log("Fetched in-progress round:", roundData.roundId);
            setInitialized(true);
            setIsLoading(false);
            console.log("Loading complete, isLoading set to false");
          } else if (isMountedRef.current) {
            console.log("No in-progress round found");
            setInitialized(true); // Still mark as initialized even if no round was found
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error fetching in-progress round:", error);
          
          if (isMountedRef.current) {
            toast({
              title: "Error loading round",
              description: "Could not load in-progress round. Please try again.",
              variant: "destructive"
            });
            
            // Still mark as initialized to prevent infinite loading
            setInitialized(true);
            setIsLoading(false);
          }
        }
      }
    } catch (error) {
      console.error("Error initializing round:", error);
      // Always ensure we exit loading state
      if (isMountedRef.current) {
        setInitialized(true);
        setIsLoading(false);
      }
    }
  }, [
    urlRoundId,
    hasRoundIdChanged,
    initialized,
    user, 
    fetchInProgressRound, 
    setCurrentRoundId,
    loadAttempt, 
    setLoadAttempt, 
    isLoading, 
    setIsLoading, 
    toast, 
    fetchRoundDetails,
    setHoleCount, 
    setCourseName
  ]);

  // Initialize the round when the component mounts or urlRoundId changes
  useEffect(() => {
    // Set mounted ref
    isMountedRef.current = true;
    
    // Initialize based on the current state
    console.log("Starting round initialization or reinit check");
    initializeRound();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [initializeRound]);

  return {
    currentRoundId,
    courseName,
    holeCount,
    isLoading,
    setCurrentRoundId
  };
};
