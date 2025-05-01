
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
  const { fetchHoleScoresFromRound, fetchHoleScoresFromCourse, initializeDefaultScores } = useHoleDataFetcher();
  
  // Prepare and fetch hole data
  const fetchHoleData = useCallback(async () => {
    if (!roundId && !courseId) {
      setLoadingStage('ready'); // Nothing to load
      return;
    }
    
    try {
      setLoadingStage('fetching');
      console.log(`fetchHoleData called with roundId: ${roundId}, courseId: ${courseId}`);
      
      // Handle new round case
      if (roundId === 'new') {
        console.log(`Creating default hole data for new round`);
        
        // If we have a courseId, try to fetch course hole data
        if (courseId) {
          try {
            console.log(`Fetching course hole data for courseId: ${courseId}`);
            const formattedScores = await fetchHoleScoresFromCourse(courseId);
            
            if (isMounted.current) {
              console.log(`Setting formatted scores with ${formattedScores.length} holes`);
              if (formattedScores.length > 0) {
                console.log(`First formatted hole: par ${formattedScores[0].par}, distance ${formattedScores[0].distance}yd`);
              }
              
              setHoleScores(formattedScores);
              setHoleCount(formattedScores.length);
              setLoadingStage('ready');
            }
            return { holeCount: formattedScores.length, courseId };
          } catch (error) {
            console.error('Error fetching course holes:', error);
          }
        }
        
        // Fallback to default data
        if (isMounted.current) {
          const defaultScores = initializeDefaultScores(18);
          setHoleScores(defaultScores);
          setHoleCount(18);
          setLoadingStage('ready');
        }
        return { holeCount: 18 };
      }
      
      // Handle invalid UUID case
      if (roundId && !validateUUID(roundId)) {
        console.log(`Creating default hole data for invalid round ID`);
        const defaultScores = initializeDefaultScores(18);
        setHoleScores(defaultScores);
        setHoleCount(18);
        setLoadingStage('ready');
        return { holeCount: 18 };
      }
      
      if (roundId) {
        console.log(`Fetching hole data for round ${roundId}`);
        
        // Use our enhanced hole data fetcher
        const result = await fetchHoleScoresFromRound(roundId);
        
        if (!result || !result.formattedScores) {
          if (isMounted.current) {
            const defaultScores = initializeDefaultScores(18);
            setHoleScores(defaultScores);
            setHoleCount(18);
            setLoadingStage('ready');
          }
          return { holeCount: 18 };
        }
        
        const { formattedScores, holeCount: fetchedHoleCount } = result;
        
        if (isMounted.current) {
          console.log('Setting formatted hole scores:', formattedScores.length);
          if (formattedScores.length > 0) {
            console.log(`Sample formatted hole: par ${formattedScores[0].par}, distance ${formattedScores[0].distance}yd`);
          }
          
          setHoleScores(formattedScores);
          setHoleCount(fetchedHoleCount || 18);
          setLoadingStage('ready');
        }
        
        return { 
          holeCount: fetchedHoleCount || 18, 
          courseId: result.courseId 
        };
      } else if (courseId) {
        // Just fetch course hole data directly
        try {
          console.log(`Fetching course hole data directly for courseId: ${courseId}`);
          const formattedScores = await fetchHoleScoresFromCourse(courseId);
          
          if (isMounted.current) {
            console.log(`Setting ${formattedScores.length} hole scores from course data`);
            if (formattedScores.length > 0) {
              console.log(`Sample formatted hole: par ${formattedScores[0].par}, distance ${formattedScores[0].distance}yd`);
            }
            
            setHoleScores(formattedScores);
            setHoleCount(formattedScores.length);
            setLoadingStage('ready');
          }
          return { holeCount: formattedScores.length, courseId };
        } catch (error) {
          console.error('Error fetching course holes directly:', error);
        }
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
        const defaultScores = initializeDefaultScores(18);
        setHoleScores(defaultScores);
        setHoleCount(18);
        setLoadingStage('ready');
      }
      
      return { holeCount: 18 };
    }
  }, [roundId, courseId, setLoadingStage, toast, fetchHoleScoresFromRound, fetchHoleScoresFromCourse, initializeDefaultScores]);
  
  // Initialize the data loading process
  useEffect(() => {
    isMounted.current = true;
    
    fetchHoleData();
    
    return () => {
      isMounted.current = false;
    };
  }, [roundId, courseId, fetchHoleData]);
  
  // Helper function to validate UUID format
  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  return {
    holeScores,
    setHoleScores,
    holeCount,
    fetchHoleData
  };
};
