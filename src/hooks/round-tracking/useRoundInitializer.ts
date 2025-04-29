
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Course, HoleData } from "@/types/round-tracking";

export const useRoundInitializer = (user: any) => {
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInProgressRound = async () => {
    if (!user) return null;

    try {
      console.log("Fetching in-progress round for user:", user.id);
      
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          id,
          hole_count,
          course_id,
          golf_courses:course_id (
            id,
            name,
            city,
            state,
            total_par
          ),
          hole_scores (*)
        `)
        .eq('user_id', user.id)
        .is('total_score', null)
        .maybeSingle();

      if (error) {
        console.error('Error fetching in-progress round:', error);
        return null;
      }

      console.log("In-progress round data:", data);

      if (data) {
        // Get tees for the course
        let courseTeesData = [];
        try {
          if (data.course_id) {
            const courseTeesResponse = await supabase
              .from('course_tees')
              .select('*')
              .eq('course_id', data.course_id);
              
            if (courseTeesResponse.error) {
              console.error('Error fetching course tees:', courseTeesResponse.error);
            } else {
              courseTeesData = courseTeesResponse.data || [];
            }
          }
        } catch (teesError) {
          console.error('Failed to fetch course tees:', teesError);
          // Continue with what we have
        }
        
        // Get hole information including distance
        let holeInfo = [];
        try {
          if (data.course_id) {
            const holeInfoResponse = await supabase
              .from('course_holes')
              .select('*')
              .eq('course_id', data.course_id);
              
            if (holeInfoResponse.error) {
              console.error('Error fetching hole info:', holeInfoResponse.error);
            } else {
              holeInfo = holeInfoResponse.data || [];
            }
          }
        } catch (holeError) {
          console.error('Failed to fetch hole info:', holeError);
          // Continue with what we have
        }
        
        return {
          roundId: data.id,
          holeCount: data.hole_count || 18,
          course: data.golf_courses ? {
            ...data.golf_courses,
            course_tees: courseTeesData
          } : null,
          holeScores: (data.hole_scores || []).map((hole: any) => {
            // Find corresponding hole info to get distance
            const courseHole = holeInfo.find((h: any) => h.hole_number === hole.hole_number);
            
            return {
              holeNumber: hole.hole_number,
              par: courseHole?.par || 4,
              distance: courseHole?.distance_yards || 0,
              score: hole.score,
              putts: hole.putts,
              fairwayHit: hole.fairway_hit,
              greenInRegulation: hole.green_in_regulation
            };
          }) || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching in-progress round:', error);
      toast({
        title: "Error loading round",
        description: "Could not load round data. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    currentRoundId,
    setCurrentRoundId,
    fetchInProgressRound
  };
};
