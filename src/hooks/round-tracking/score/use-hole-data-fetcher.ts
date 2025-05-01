
import { supabase } from "@/integrations/supabase/client";
import { formatHoleScores } from "./use-hole-data-formatter";
import { useToast } from "@/hooks/use-toast";

export const useHoleDataFetcher = () => {
  const { toast } = useToast();

  const fetchHoleScoresFromRound = async (roundId: string) => {
    try {
      // Check if this is a "new" round or invalid UUID
      if (roundId === 'new' || !validateUUID(roundId)) {
        console.log('Creating default hole scores for new round');
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
          console.log(`Round ${roundId} is for course ${courseId} with ${holeCount} holes`);
        }
      } catch (roundError) {
        console.error('Failed to fetch round data:', roundError);
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
            console.log(`Found ${holeInfo.length} holes for course ${courseId}`);
            
            if (holeInfo.length > 0) {
              console.log(`Sample hole data - Hole 1: par ${holeInfo[0]?.par}, distance ${holeInfo[0]?.distance_yards}yd`);
            }
          }
        } catch (courseError) {
          console.error('Failed to fetch course holes:', courseError);
        }
      }

      const formattedScores = formatHoleScores(holeScoresData || [], holeInfo, holeCount);
      console.log('Formatted hole scores with course data (from round):', formattedScores.length);
      
      return { holeCount, formattedScores };
    } catch (error) {
      console.error('Error fetching hole scores from round:', error);
      toast({
        title: "Error loading round data",
        description: "Could not load hole scores. Please try again.",
        variant: "destructive"
      });
      
      return { 
        holeCount: 18, 
        formattedScores: formatHoleScores([], [], 18) 
      };
    }
  };

  const fetchHoleScoresFromCourse = async (courseId: string) => {
    try {
      if (!courseId) {
        console.log('No course ID provided, returning default scores');
        return formatHoleScores([], [], 18);
      }
      
      console.log('Directly fetching course holes for course ID:', courseId);
      
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
      console.log(`Found ${holeInfo.length} course holes data (direct)`);
      
      if (holeInfo.length > 0) {
        console.log(`Sample hole data - Hole 1: par ${holeInfo[0]?.par}, distance ${holeInfo[0]?.distance_yards}yd`);
      }

      const formattedScores = formatHoleScores([], holeInfo);
      console.log('Formatted hole scores with course data (direct):', formattedScores.length);
      
      return formattedScores;
    } catch (error) {
      console.error('Error fetching hole scores from course:', error);
      // Return default scores instead of throwing
      return formatHoleScores([], [], 18);
    }
  };

  // Helper function to validate UUID format
  const validateUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  return {
    fetchHoleScoresFromRound,
    fetchHoleScoresFromCourse
  };
};
