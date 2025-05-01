
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HoleData } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";

export const useHoleDataFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch hole scores for a specific round and merge with course data
  const fetchHoleScoresFromRound = useCallback(async (roundId: string) => {
    setIsLoading(true);
    console.log('Fetching hole scores and course data for round:', roundId);
    
    try {
      // First get the round details including course ID
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select(`
          id,
          hole_count,
          course_id,
          hole_scores (*)
        `)
        .eq('id', roundId)
        .single();
      
      if (roundError) {
        console.error('Error fetching round data:', roundError);
        throw roundError;
      }
      
      if (!roundData) {
        console.warn('No round data found for ID:', roundId);
        return { formattedScores: [], holeCount: 18 };
      }
      
      const holeCount = roundData.hole_count || 18;
      const courseId = roundData.course_id;
      const holeScores = roundData.hole_scores || [];
      
      console.log(`Found ${holeScores.length} hole scores for round ${roundId}`);
      console.log(`Hole count: ${holeCount}, Course ID: ${courseId}`);
      
      // If we have a course ID, fetch course hole information
      let courseHoles: any[] = [];
      if (courseId) {
        const { data: holeData, error: holeError } = await supabase
          .from('course_holes')
          .select('*')
          .eq('course_id', courseId)
          .order('hole_number');
          
        if (holeError) {
          console.error('Error fetching course holes:', holeError);
        } else if (holeData) {
          courseHoles = holeData;
          console.log(`Found ${courseHoles.length} course holes for course ${courseId}`);
        }
      }
      
      // Format and merge the data
      const formattedScores = formatHoleScores(holeScores, courseHoles, holeCount);
      console.log('Pre-populated hole data with course information:', formattedScores);
      
      return {
        formattedScores,
        holeCount,
        courseId
      };
    } catch (error) {
      console.error('Error in fetchHoleScoresFromRound:', error);
      toast({
        title: "Error loading round data",
        description: "Could not load hole scores. Using default values.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Fetch course holes directly by course ID
  const fetchHoleScoresFromCourse = useCallback(async (courseId: string) => {
    setIsLoading(true);
    console.log('Fetching hole data directly for course:', courseId);
    
    try {
      const { data: courseHoles, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
        
      if (error) {
        console.error('Error fetching course holes:', error);
        throw error;
      }
      
      if (!courseHoles || courseHoles.length === 0) {
        console.log('No course holes found, returning default data');
        return initializeDefaultScores(18);
      }
      
      console.log(`Found ${courseHoles.length} holes for course ${courseId}`);
      
      // Format the data with empty scores but course hole information
      return formatHoleScores([], courseHoles, courseHoles.length);
    } catch (error) {
      console.error('Error in fetchHoleScoresFromCourse:', error);
      return initializeDefaultScores(18);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Helper function to format hole scores with course data
  const formatHoleScores = (scores: any[], courseHoles: any[], holeCount: number = 18): HoleData[] => {
    console.log(`Formatting ${scores.length} scores with ${courseHoles.length} course holes`);
    
    return Array.from({ length: holeCount }, (_, i) => {
      const holeNumber = i + 1;
      const existingScore = scores.find(score => score.hole_number === holeNumber);
      const courseHole = courseHoles.find(hole => hole.hole_number === holeNumber);
      
      if (courseHole) {
        console.log(`Hole ${holeNumber} data - Par: ${courseHole.par}, Distance: ${courseHole.distance_yards}yd`);
      }
      
      return {
        holeNumber: holeNumber,
        par: courseHole?.par || 4,
        distance: courseHole?.distance_yards || 0,
        score: existingScore?.score || 0,
        putts: existingScore?.putts || 0,
        fairwayHit: existingScore?.fairway_hit || false,
        greenInRegulation: existingScore?.green_in_regulation || false
      };
    });
  };
  
  // Helper function to initialize default scores
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
    fetchHoleScoresFromRound,
    fetchHoleScoresFromCourse,
    isLoading
  };
};
