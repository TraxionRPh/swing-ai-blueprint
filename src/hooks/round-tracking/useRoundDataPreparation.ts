
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HoleData } from "@/types/round-tracking";
import { LoadingStage } from "./useRoundLoadingState";

interface RoundDataPreparationProps {
  roundId: string | null;
  courseId?: string;
  setLoadingStage: (stage: LoadingStage) => void;
}

export const useRoundDataPreparation = ({ roundId, courseId, setLoadingStage }: RoundDataPreparationProps) => {
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [holeCount, setHoleCount] = useState<number | null>(null);
  const { toast } = useToast();
  const fetchAttemptRef = useRef(0);
  const isMounted = useRef(true);
  
  // Prepare and fetch hole data
  const fetchHoleData = useCallback(async () => {
    if (!roundId) {
      setLoadingStage('ready'); // Nothing to load
      return;
    }
    
    try {
      setLoadingStage('fetching');
      console.log(`Fetching hole data for round ${roundId} (attempt ${fetchAttemptRef.current + 1})`);
      
      // Get round data including course, hole count and any existing scores
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select(`
          id,
          hole_count,
          course_id,
          hole_scores (*)
        `)
        .eq('id', roundId)
        .maybeSingle();
        
      if (roundError) {
        console.error('Error fetching round data:', roundError);
        throw roundError;
      }
      
      if (!roundData) {
        console.error('No round data found');
        throw new Error('Round data not found');
      }
      
      setHoleCount(roundData.hole_count || 18);
      
      // Fetch course hole information for distance and par
      const { data: holeInfo, error: holeError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', roundData.course_id)
        .order('hole_number');
        
      if (holeError) {
        console.error('Error fetching course hole data:', holeError);
        // Don't throw here, we can proceed with default values
      }
      
      // Format hole scores with course data
      const formattedScores = formatHoleScores(
        roundData.hole_scores || [], 
        holeInfo || [], 
        roundData.hole_count || 18
      );
      
      if (isMounted.current) {
        console.log('Setting formatted hole scores:', formattedScores.length);
        setHoleScores(formattedScores);
        setLoadingStage('ready');
      }
      
      return { holeCount: roundData.hole_count || 18, courseId: roundData.course_id };
    } catch (error) {
      console.error('Error in fetchHoleData:', error);
      fetchAttemptRef.current += 1;
      
      if (fetchAttemptRef.current < 3) {
        // Retry with exponential backoff
        const delay = Math.pow(2, fetchAttemptRef.current) * 500;
        console.log(`Retrying in ${delay}ms...`);
        setTimeout(() => {
          if (isMounted.current) {
            fetchHoleData();
          }
        }, delay);
      } else {
        toast({
          title: "Error loading hole data",
          description: "Could not load hole scores. Using default values.",
          variant: "destructive"
        });
        
        // Use default data if all retries fail
        if (isMounted.current) {
          setHoleScores(initializeDefaultScores(18));
          setLoadingStage('ready');
        }
      }
      return null;
    }
  }, [roundId, setLoadingStage, toast]);
  
  // Initialize the data loading process
  useEffect(() => {
    isMounted.current = true;
    fetchAttemptRef.current = 0;
    
    if (roundId) {
      fetchHoleData();
    } else if (courseId) {
      // Just initialize with default scores for a new round
      setHoleScores(initializeDefaultScores(18));
      setLoadingStage('ready');
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [roundId, courseId, fetchHoleData, setLoadingStage]);
  
  // Helper functions
  const formatHoleScores = (scores: any[], holeInfo: any[], holeCount: number): HoleData[] => {
    return Array.from({ length: holeCount }, (_, i) => {
      const existingHole = scores.find(h => h.hole_number === i + 1);
      const courseHole = holeInfo.find(h => h.hole_number === i + 1);
      
      return {
        holeNumber: i + 1,
        par: courseHole?.par || 4,
        distance: courseHole?.distance_yards || 0,
        score: existingHole?.score || 0,
        putts: existingHole?.putts || 0,
        fairwayHit: existingHole?.fairway_hit || false,
        greenInRegulation: existingHole?.green_in_regulation || false
      };
    });
  };
  
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
  
  return {
    holeScores,
    setHoleScores,
    holeCount
  };
};
