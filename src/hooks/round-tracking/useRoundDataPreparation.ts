
import { useEffect, useCallback, useState } from "react";
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
  const { isLoading, setIsLoading, loadAttempt, setLoadAttempt } = useRoundLoadingState();
  const { courseName, setCourseName, holeCount, setHoleCount } = useRoundCourseInfo();
  const { currentRoundId, setCurrentRoundId, fetchInProgressRound } = useRoundManagement(user);
  const { fetchRoundDetails } = useRoundInitialization(user, currentRoundId, setCurrentRoundId);
  
  const maxInitAttempts = 3;
  
  // Initialize the round when the component mounts
  useEffect(() => {
    let isMounted = true;
    
    if (initialized && currentRoundId) {
      // If we're already initialized with a valid round ID, don't re-initialize
      return;
    }
    
    const initializeRound = async () => {
      if (loadAttempt > maxInitAttempts) {
        console.log(`Max initialization attempts (${maxInitAttempts}) reached, stopping retries`);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // If roundId is provided in URL, use that instead of fetching
        if (urlRoundId) {
          console.log("Using round ID from URL:", urlRoundId);
          setCurrentRoundId(urlRoundId);
          
          // Fetch course name and hole count for the round
          try {
            const data = await fetchRoundDetails(urlRoundId);
            
            if (data?.golf_courses?.name && isMounted) {
              setCourseName(data.golf_courses.name);
              console.log("Set course name:", data.golf_courses.name);
            }
            
            if (data?.hole_count && isMounted) {
              setHoleCount(data.hole_count);
              console.log("Set hole count:", data.hole_count);
            }
            
            if (isMounted) {
              setInitialized(true);
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
            if (isMounted && loadAttempt < maxInitAttempts) {
              setTimeout(() => setLoadAttempt(prev => prev + 1), 2000);
            }
          }
        } else {
          try {
            console.log("No roundId in URL, fetching in-progress round");
            const roundData = await fetchInProgressRound();
            if (roundData && isMounted) {
              setCurrentRoundId(roundData.roundId);
              setHoleCount(roundData.holeCount || 18);
              setCourseName(roundData.course?.name || null);
              console.log("Fetched in-progress round:", roundData.roundId);
              setInitialized(true);
            } else {
              console.log("No in-progress round found");
              setInitialized(true); // Still mark as initialized even if no round was found
            }
          } catch (error) {
            console.error("Error fetching in-progress round:", error);
            toast({
              title: "Error loading round",
              description: "Could not load in-progress round. Please try again.",
              variant: "destructive"
            });
            
            // Still mark as initialized to prevent infinite loading
            if (isMounted) {
              setInitialized(true);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing round:", error);
        // Always ensure we exit loading state
        if (isMounted) {
          setInitialized(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log("Loading complete, isLoading set to false");
        }
      }
    };

    initializeRound();
    
    return () => {
      isMounted = false;
    };
  }, [urlRoundId, user, fetchInProgressRound, setCurrentRoundId, 
      loadAttempt, setLoadAttempt, setIsLoading, toast, fetchRoundDetails,
      setHoleCount, setCourseName, initialized, currentRoundId]);

  return {
    currentRoundId,
    courseName,
    holeCount,
    isLoading,
    setCurrentRoundId
  };
};
