
import { supabase } from "@/integrations/supabase/client";
import { formatHoleScores } from "./use-hole-data-formatter";
import { useToast } from "@/hooks/use-toast";

export const useHoleDataFetcher = () => {
  const { toast } = useToast();

  const fetchHoleScoresFromRound = async (roundId: string) => {
    try {
      // First check if we're online
      if (!navigator.onLine) {
        console.log('Device appears to be offline, using default hole data');
        return { 
          holeCount: 18, 
          formattedScores: formatHoleScores([], [], 18) 
        };
      }
      
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
      let roundData = null;
      let courseId = null;
      let holeCount = 18;
      
      try {
        const roundResponse = await supabase
          .from('rounds')
          .select('course_id, hole_count')
          .eq('id', roundId)
          .maybeSingle();
          
        if (roundResponse.error) {
          console.error('Error fetching round data:', roundResponse.error);
        } else {
          roundData = roundResponse.data;
          courseId = roundData?.course_id;
          holeCount = roundData?.hole_count || 18;
        }
      } catch (roundError) {
        console.error('Failed to fetch round data:', roundError);
        // Continue with default values
      }
      
      let holeInfo: any[] = [];
      
      if (courseId) {
        try {
          console.log('Fetching course holes for course (from round):', courseId);
          const courseHolesResponse = await supabase
            .from('course_holes')
            .select('*')
            .eq('course_id', courseId)
            .order('hole_number');
            
          if (courseHolesResponse.error) {
            console.error('Error fetching course holes:', courseHolesResponse.error);
          } else {
            holeInfo = courseHolesResponse.data || [];
            console.log('Course holes data (from round):', holeInfo);
          }
        } catch (courseError) {
          console.error('Failed to fetch course holes:', courseError);
          // Continue with empty hole info
        }
      }

      const formattedScores = formatHoleScores(holeScoresData || [], holeInfo, holeCount);
      console.log('Formatted hole scores with course data (from round):', formattedScores);
      
      // Return an object with holeCount and formatted scores
      return { holeCount, formattedScores };
    } catch (error) {
      console.error('Error fetching hole scores from round:', error);
      // Don't show toast on network errors - they're expected in offline scenarios
      if (!(error instanceof TypeError && error.message === "Failed to fetch") && navigator.onLine) {
        toast({
          title: "Error loading round data",
          description: "Could not load hole scores. Please try again.",
          variant: "destructive"
        });
      }
      
      // Return default formatted scores instead of throwing
      return { 
        holeCount: 18, 
        formattedScores: formatHoleScores([], [], 18) 
      };
    }
  };

  const fetchHoleScoresFromCourse = async (courseId: string) => {
    try {
      // First check if we're online
      if (!navigator.onLine) {
        console.log('Device appears to be offline, using default course data');
        return formatHoleScores([], [], 18);
      }
      
      console.log('Directly fetching course holes for course:', courseId);
      
      // Get course hole data directly
      const { data: courseHoles, error: courseHolesError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
        
      if (courseHolesError) {
        console.error('Error fetching course holes:', courseHolesError);
        throw courseHolesError;
      }
      
      const holeInfo = courseHoles || [];
      console.log('Course holes data (direct):', holeInfo);

      const formattedScores = formatHoleScores([], holeInfo);
      console.log('Formatted hole scores with course data (direct):', formattedScores);
      
      return formattedScores;
    } catch (error) {
      console.error('Error fetching hole scores from course:', error);
      // Return default scores instead of throwing
      return formatHoleScores([], [], 18);
    }
  };

  return {
    fetchHoleScoresFromRound,
    fetchHoleScoresFromCourse
  };
};
