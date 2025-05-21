
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HoleData, Course } from "@/types/round-tracking";

export const useRoundData = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [holeCount, setHoleCount] = useState<number>(18);
  const [fetchAttempts, setFetchAttempts] = useState<number>(0);
  const [hasFetchError, setHasFetchError] = useState<boolean>(false);

  // Initialize hole scores when hole count changes
  useEffect(() => {
    if (holeCount) {
      initializeHoleScores();
    }
  }, [holeCount]);

  // Initialize empty hole scores based on hole count
  const initializeHoleScores = () => {
    const newScores = Array.from({ length: holeCount }, (_, i) => ({
      holeNumber: i + 1,
      par: 4, // Default par
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }));
    
    setHoleScores(newScores);
  };
  
  // Fetch round data from Supabase
  const fetchRoundData = useCallback(async (roundId: string) => {
    if (!roundId) return null;
    
    // Don't attempt to fetch if we've already encountered errors
    if (fetchAttempts > 2 && hasFetchError) {
      console.log(`Skipping fetch attempt ${fetchAttempts} due to previous errors`);
      return null;
    }
    
    setIsLoading(true);
    setFetchAttempts(prev => prev + 1);
    console.log(`Fetching round data for round ID: ${roundId} (attempt ${fetchAttempts + 1})`);
    
    try {
      // Fetch round details
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select(`
          *,
          golf_courses:course_id (
            id,
            name,
            city,
            state,
            total_par
          )
        `)
        .eq('id', roundId)
        .single();
      
      if (roundError) throw roundError;
      
      if (roundData) {
        console.log('Round data fetched:', roundData);
        
        // Fetch hole scores for this round
        const { data: holeData, error: holeError } = await supabase
          .from('hole_scores')
          .select('*')
          .eq('round_id', roundId)
          .order('hole_number');
        
        if (holeError) throw holeError;
        console.log('Hole scores fetched:', holeData);
        
        // Fetch course tees separately to avoid the error with course_tees relation
        const { data: courseTees, error: teesError } = await supabase
          .from('course_tees')
          .select('*')
          .eq('course_id', roundData.course_id);
          
        if (teesError) throw teesError;
        
        // Set course and tee
        if (roundData.golf_courses) {
          const courseWithTees: Course = {
            ...roundData.golf_courses,
            course_tees: courseTees || []
          };
          
          setSelectedCourse(courseWithTees);
          setHoleCount(roundData.hole_count || 18);
          
          // Format hole scores
          if (holeData && holeData.length > 0) {
            // Create a complete array with all holes
            const formattedScores = Array.from({ length: roundData.hole_count || 18 }, (_, i) => {
              const holeNumber = i + 1;
              const existingScore = holeData.find(h => h.hole_number === holeNumber);
              
              return {
                holeNumber,
                par: 4, // Default par since it's not stored in the database
                distance: 0,
                // Ensure we use the actual score value if it exists, otherwise use 0
                score: existingScore?.score ?? 0,
                putts: existingScore?.putts ?? 0,
                fairwayHit: existingScore?.fairway_hit ?? false,
                greenInRegulation: existingScore?.green_in_regulation ?? false
              };
            });
            
            console.log('Formatted hole scores with existing data:', formattedScores);
            setHoleScores(formattedScores);
          } else {
            // If no hole scores found, initialize with empty scores
            initializeHoleScores();
          }
          
          // Reset error state on successful fetch
          setHasFetchError(false);
          
          return { 
            courseWithTees, 
            teeId: roundData.tee_id, 
            holeCount: roundData.hole_count || 18 
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching round data:", error);
      setHasFetchError(true);
      
      // Only show toast on first few errors to avoid spamming
      if (fetchAttempts <= 2) {
        toast({
          title: "Error loading round data",
          description: "Could not load round details. Please check your connection and try again.",
          variant: "destructive"
        });
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAttempts, hasFetchError, toast]);

  return {
    isLoading,
    setIsLoading,
    holeScores,
    setHoleScores,
    selectedCourse,
    setSelectedCourse,
    holeCount,
    setHoleCount,
    initializeHoleScores,
    fetchRoundData,
    hasFetchError
  };
};
