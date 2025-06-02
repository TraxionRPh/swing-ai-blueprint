
import { useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-native";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types/round-tracking";

interface RoundSetupProps {
  currentRoundId: string | null;
  setCurrentRoundId: (id: string | null) => void;
  fetchRoundDetails: (roundId: string) => Promise<any>;
  fetchInProgressRound: () => Promise<any>;
  setCourseName: (name: string | null) => void;
  setHoleCount: (count: number) => void;
  setRoundsById: (setter: (prev: any) => any) => void;
  setHoleScores: (scores: any) => void;
  setLoadingStage: (stage: string) => void;
  setError: (error: string | null) => void;
  updateCourseName: (course: Course | null) => void;
  selectedCourse: Course | null;
}

export const useRoundSetup = ({
  currentRoundId,
  setCurrentRoundId,
  fetchRoundDetails,
  fetchInProgressRound,
  setCourseName,
  setHoleCount,
  setRoundsById,
  setHoleScores,
  setLoadingStage,
  setError,
  updateCourseName,
  selectedCourse
}: RoundSetupProps) => {
  const { roundId: urlRoundId } = useParams();
  const { toast } = useToast();
  const location = useLocation();
  const initRunRef = useRef(false);
  
  // Update course name when selected course changes
  useEffect(() => {
    updateCourseName(selectedCourse);
  }, [selectedCourse, updateCourseName]);

  // Initialize the round when the component mounts or round ID changes
  useEffect(() => {
    let isMounted = true;
    
    // Prevent redundant initialization
    if (initRunRef.current && !currentRoundId) {
      return;
    }
    
    initRunRef.current = true;
    
    const initializeRound = async () => {
      try {
        setLoadingStage('initializing');
        
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
            
            // Store round data in the roundsById object
            if (data && isMounted) {
              setRoundsById(prev => ({
                ...prev,
                [urlRoundId]: data
              }));
              console.log("Set round data for ID:", urlRoundId);
            }
            
            setLoadingStage('preparing');
          } catch (error) {
            console.error("Error fetching round details:", error);
            setError("Could not load round details");
            
            // Show toast for user feedback
            toast({
              title: "Error loading round",
              description: "Could not load round details. Please try again.",
              variant: "destructive"
            });
          }
        } else if (!currentRoundId) {
          try {
            console.log("No roundId in URL, fetching in-progress round");
            const roundData = await fetchInProgressRound();
            
            if (roundData && isMounted) {
              setCurrentRoundId(roundData.roundId);
              setHoleScores(roundData.holeScores);
              setHoleCount(roundData.holeCount || 18);
              setCourseName(roundData.course?.name || null);
              
              // Store round data in the roundsById object
              if (roundData.roundId) {
                setRoundsById(prev => ({
                  ...prev,
                  [roundData.roundId]: roundData
                }));
                console.log("Set round data for in-progress round:", roundData.roundId);
              }
              
              console.log("Fetched in-progress round:", roundData.roundId);
              setLoadingStage('preparing');
            } else {
              console.log("No in-progress round found");
              setLoadingStage('ready');
            }
          } catch (error) {
            console.error("Error fetching in-progress round:", error);
            setError("Could not load in-progress round");
            toast({
              title: "Error loading round",
              description: "Could not load in-progress round. Please try again.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Error initializing round:", error);
        setError("Failed to initialize round");
      }
    };

    initializeRound();
    
    return () => {
      isMounted = false;
    };
  }, [urlRoundId, fetchRoundDetails, setLoadingStage, setError, fetchInProgressRound, 
      currentRoundId, setCurrentRoundId, setCourseName, setHoleCount, setRoundsById, 
      setHoleScores, toast]);
};
