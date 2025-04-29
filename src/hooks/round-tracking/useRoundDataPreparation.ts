
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
  const { isLoading, setIsLoading, loadAttempt, setLoadAttempt } = useRoundLoadingState();
  const { courseName, setCourseName, holeCount, setHoleCount } = useRoundCourseInfo();
  const { currentRoundId, setCurrentRoundId, fetchInProgressRound } = useRoundManagement(user);
  const { fetchRoundDetails } = useRoundInitialization(user, currentRoundId, setCurrentRoundId);
  
  const maxInitAttempts = 3;
  
  const initializeRound = useCallback(async () => {
    // Skip if initialization has already started
    if (initializationStartedRef.current) {
      console.log("Round initialization already started, skipping");
      return;
    }
    
    // Mark initialization as started
    initializationStartedRef.current = true;
    
    if (loadAttempt > maxInitAttempts) {
      console.log(`Max initialization attempts (${maxInitAttempts}) reached, stopping retries`);
      setIsLoading(false);
      return;
    }

    try {
      // Only set loading state if it's not already loading to avoid state thrashing
      if (!isLoading) {
        setIsLoading(true);
      }
      
      // If roundId is provided in URL, use that instead of fetching
      if (urlRoundId) {
        console.log("Using round ID from URL:", urlRoundId);
        setCurrentRoundId(urlRoundId);
        
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
          }
        } catch (error) {
          console.error("Error fetching round details:", error);
          
          // Show toast only if this isn't a retry
          if (loadAttempt === 0) {
            toast({
              title: "Error loading round",
              description: "Could not load round details. Will retry automatically.",
              variant: "destructive"
            });
          }
          
          // Set retry
          if (isMountedRef.current && loadAttempt < maxInitAttempts) {
            setTimeout(() => setLoadAttempt(prev => prev + 1), 1000);
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
          toast({
            title: "Error loading round",
            description: "Could not load in-progress round. Please try again.",
            variant: "destructive"
          });
          
          // Still mark as initialized to prevent infinite loading
          if (isMountedRef.current) {
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
  }, [urlRoundId, user, fetchInProgressRound, setCurrentRoundId, 
      loadAttempt, setLoadAttempt, isLoading, setIsLoading, toast, fetchRoundDetails,
      setHoleCount, setCourseName]);

  // Initialize the round when the component mounts
  useEffect(() => {
    isMountedRef.current = true;
    
    // Run initialization only once
    if (!initialized) {
      console.log("Starting round initialization");
      initializeRound();
    }
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [initialized, initializeRound]);

  return {
    currentRoundId,
    courseName,
    holeCount,
    isLoading,
    setCurrentRoundId
  };
};
