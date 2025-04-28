
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HoleData } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";

export const useHoleScores = (roundId: string | null, courseId?: string) => {
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchHoleScoresFromRound = useCallback(async (roundId: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching hole scores for round:', roundId);
      // First get the scores for this round
      const { data: holeScoresData, error: holeScoresError } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', roundId)
        .order('hole_number');

      if (holeScoresError) {
        console.error('Error fetching hole scores:', holeScoresError);
        throw holeScoresError;
      }

      // Get course info to fetch hole data
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select('course_id, hole_count')
        .eq('id', roundId)
        .single();
        
      if (roundError) {
        console.error('Error fetching round data:', roundError);
        throw roundError;
      }
      
      let holeInfo: any[] = [];
      if (roundData?.course_id) {
        console.log('Fetching course holes for course (from round):', roundData.course_id);
        const { data: courseHoles, error: courseHolesError } = await supabase
          .from('course_holes')
          .select('*')
          .eq('course_id', roundData.course_id)
          .order('hole_number');
          
        if (courseHolesError) {
          console.error('Error fetching course holes:', courseHolesError);
          throw courseHolesError;
        }
        holeInfo = courseHoles || [];
        console.log('Course holes data (from round):', holeInfo);
      }

      const holeCount = roundData?.hole_count || 18;
      const formattedScores = formatHoleScores(holeScoresData || [], holeInfo, holeCount);
      console.log('Formatted hole scores with course data (from round):', formattedScores);
      setHoleScores(formattedScores);
      return { holeCount };
    } catch (error) {
      console.error('Error fetching hole scores from round:', error);
      toast.toast({
        title: "Error loading round data",
        description: "Could not load hole scores. Please try again.",
        variant: "destructive"
      });
      initializeDefaultScores();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (roundId) {
      fetchHoleScoresFromRound(roundId);
    } else if (courseId) {
      fetchHoleScoresFromCourse(courseId);
    } else if (holeScores.length === 0) {
      initializeDefaultScores();
    }
  }, [roundId, courseId]);

  const fetchHoleScoresFromCourse = async (courseId: string) => {
    setIsLoading(true);
    try {
      console.log('Directly fetching course holes for course:', courseId);
      
      // Get course hole data directly
      const { data: courseHoles, error: courseHolesError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
        
      if (courseHolesError) throw courseHolesError;
      
      const holeInfo = courseHoles || [];
      console.log('Course holes data (direct):', holeInfo);

      const formattedScores = formatHoleScores([], holeInfo);
      console.log('Formatted hole scores with course data (direct):', formattedScores);
      setHoleScores(formattedScores);
    } catch (error) {
      console.error('Error fetching hole scores from course:', error);
      initializeDefaultScores();
    } finally {
      setIsLoading(false);
    }
  };

  const formatHoleScores = (scores: any[], holeInfo: any[], holeCount: number = 18): HoleData[] => {
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

  const initializeDefaultScores = () => {
    const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }));
    setHoleScores(defaultHoles);
  };

  return {
    holeScores,
    setHoleScores,
    isLoading,
    fetchHoleScoresFromRound
  };
};
