
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HoleData, Course } from "@/types/round-tracking";

export const useRoundData = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [holeCount, setHoleCount] = useState<number>(18);

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
  const fetchRoundData = async (roundId: string) => {
    if (!roundId) return;
    
    setIsLoading(true);
    
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
          return { courseWithTees, teeId: roundData.tee_id, holeCount: roundData.hole_count || 18 };
        }
        
        // Fetch hole scores
        const { data: holeData, error: holeError } = await supabase
          .from('hole_scores')
          .select('*')
          .eq('round_id', roundId)
          .order('hole_number');
        
        if (holeError) throw holeError;
        
        // Format hole scores
        if (holeData) {
          const formattedScores = Array.from({ length: roundData.hole_count || 18 }, (_, i) => {
            const holeNumber = i + 1;
            const existingScore = holeData.find(h => h.hole_number === holeNumber);
            
            // Create a default par value since it might not exist in the database
            const defaultPar = 4;
            const holePar = existingScore && 'par' in existingScore 
              ? (existingScore as any).par 
              : defaultPar;
            
            return {
              holeNumber,
              par: holePar,
              distance: 0,
              score: existingScore?.score || 0,
              putts: existingScore?.putts || 0,
              fairwayHit: existingScore?.fairway_hit || false,
              greenInRegulation: existingScore?.green_in_regulation || false
            };
          });
          
          setHoleScores(formattedScores);
          return { formattedScores };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching round data:", error);
      toast({
        title: "Error loading round data",
        description: "Could not load round details. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

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
    fetchRoundData
  };
};
