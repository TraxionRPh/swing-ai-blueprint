
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Course } from "@/types/round-tracking";

export const useRoundInitialization = (user: any, currentRoundId: string | null, setCurrentRoundId: (id: string | null) => void) => {
  const [courseName, setCourseName] = useState<string | null>(null);
  const [holeCount, setHoleCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [initAttempt, setInitAttempt] = useState(0);

  // Function to fetch details of a specific round
  const fetchRoundDetails = useCallback(async (roundId: string) => {
    try {
      console.log("Fetching round details for:", roundId);
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          hole_count,
          golf_courses:course_id (
            id,
            name,
            city,
            state,
            total_par,
            course_tees (*)
          )
        `)
        .eq('id', roundId)
        .maybeSingle();
          
      if (error) {
        console.error("Error fetching round data:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in fetchRoundDetails:", error);
      return null;
    }
  }, []);

  // Update course name when selected course changes
  const updateCourseName = (course: Course | null) => {
    if (course) {
      setCourseName(course.name);
    }
  };

  return {
    courseName,
    setCourseName,
    holeCount,
    setHoleCount,
    isLoading,
    setIsLoading,
    initAttempt,
    setInitAttempt,
    fetchRoundDetails,
    updateCourseName
  };
};
