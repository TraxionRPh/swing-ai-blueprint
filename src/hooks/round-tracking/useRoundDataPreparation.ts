
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HoleData } from "@/types/round-tracking";
import { LoadingStage } from "./useRoundLoadingState";
import { useHoleDataFetcher } from "./hole-score/useHoleDataFetcher";

interface RoundDataPreparationProps {
  roundId: string | null;
  courseId?: string;
  setLoadingStage: (stage: LoadingStage) => void;
}

export const useRoundDataPreparation = ({ roundId, courseId, setLoadingStage }: RoundDataPreparationProps) => {
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [holeCount, setHoleCount] = useState<number | null>(null);
  const { toast } = useToast();
  const isMounted = useRef(true);
  const { fetchHoleScoresFromRound, fetchHoleScoresFromCourse } = useHoleDataFetcher();
  
  // Prepare and fetch hole data
  const fetchHoleData = useCallback(async () => {
    if (!roundId && !courseId) {
      setLoadingStage('ready'); // Nothing to load
      return;
    }
    
    try {
      setLoadingStage('fetching');
      
      // Special case for new rounds or invalid UUIDs
      if (roundId === 'new') {
        console.log(`Creating default hole data for new round`);
        
        // If we have a courseId, try to fetch course hole data
        if (courseId) {
          try {
            console.log(`Fetching course hole data for courseId: ${courseId}`);
            const formattedScores = await fetchHoleScoresFromCourse(courseId);
            
            if (isMounted.current) {
              setHoleScores(formattedScores);
              setHoleCount(formattedScores.length);
              setLoadingStage('ready');
            }
            return;
          } catch (error) {
            console.error('Error fetching course holes:', error);
          }
        }
        
        // Fallback to default data
        if (isMounted.current) {
          setHoleScores(initializeDefaultScores(18));
          setLoadingStage('ready');
        }
        return;
      }
      
      // Special case for invalid UUIDs - use default data
      if (roundId && !validateUUID(roundId)) {
        console.log(`Using default data for non-UUID roundId: ${roundId}`);
        if (isMounted.current) {
          setHoleScores(initializeDefaultScores(18));
          setLoadingStage('ready');
        }
        return;
      }
      
      if (roundId && roundId !== 'new') {
        console.log(`Fetching hole data for round ${roundId}`);
        
        // Use our enhanced hole data fetcher
        const result = await fetchHoleScoresFromRound(roundId);
        
        if (!result) {
          if (isMounted.current) {
            setHoleScores(initializeDefaultScores(18));
            setLoadingStage('ready');
          }
          return;
        }
        
        const { formattedScores, holeCount: fetchedHoleCount } = result;
        
        if (isMounted.current) {
          console.log('Setting formatted hole scores:', formattedScores.length);
          setHoleScores(formattedScores);
          setHoleCount(fetchedHoleCount || 18);
          setLoadingStage('ready');
        }
        
        return { holeCount: fetchedHoleCount || 18, courseId: result.courseId };
      }
    } catch (error) {
      console.error('Error in fetchHoleData:', error);
      
      toast({
        title: "Error loading hole data",
        description: "Could not load hole scores. Using default values.",
        variant: "destructive"
      });
      
      // Use default data on error
      if (isMounted.current) {
        setHoleScores(initializeDefaultScores(18));
        setLoadingStage('ready');
      }
      
      return null;
    }
  }, [roundId, courseId, setLoadingStage, toast, fetchHoleScoresFromRound, fetchHoleScoresFromCourse]);
  
  // Initialize the data loading process
  useEffect(() => {
    isMounted.current = true;
    
    fetchHoleData();
    
    return () => {
      isMounted.current = false;
    };
  }, [roundId, courseId, fetchHoleData]);
  
  // Helper functions
  const initializeDefaultScores = (holeCount: number = 18): HoleData[] => {
    return Array.from({ length: holeCount }, (_, i) => ({
      holeNumber: i + 1,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }));
  };
  
  // Helper function to validate UUID format
  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  return {
    holeScores,
    setHoleScores,
    holeCount
  };
};
