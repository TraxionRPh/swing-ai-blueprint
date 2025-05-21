
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { HoleData } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";

export interface RoundStats {
  totalScore: number;
  totalPutts: number;
  fairwaysHit: number;
  greensInRegulation: number;
  totalHoles: number;
  parTotal: number;
  courseName: string;
  date: string;
  fairwayEligibleHoles: number;
}

export const useRoundReviewData = (roundId: string | undefined) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [roundStats, setRoundStats] = useState<RoundStats>({
    totalScore: 0,
    totalPutts: 0,
    fairwaysHit: 0,
    greensInRegulation: 0,
    totalHoles: 0,
    parTotal: 0,
    courseName: "",
    date: new Date().toLocaleDateString(),
    fairwayEligibleHoles: 0
  });

  useEffect(() => {
    if (roundId) {
      loadRoundData();
    }
  }, [roundId]);

  const loadRoundData = async () => {
    try {
      setIsLoading(true);
      
      // Get round details
      const { data: roundData, error: roundError } = await supabase
        .from("rounds")
        .select("hole_count, course_id, date")
        .eq("id", roundId)
        .single();
      
      if (roundError) throw roundError;
      
      // Get hole scores
      const { data: holeScoresData, error: scoresError } = await supabase
        .from("hole_scores")
        .select("*")
        .eq("round_id", roundId)
        .order("hole_number");
      
      if (scoresError) throw scoresError;
      
      // Get course information
      const { data: courseData, error: courseError } = await supabase
        .from("golf_courses")
        .select("name, total_par")
        .eq("id", roundData.course_id)
        .single();
      
      if (courseError) throw courseError;
      
      // Get course holes information
      const { data: courseHolesData } = await supabase
        .from("course_holes")
        .select("hole_number, par")
        .eq("course_id", roundData.course_id)
        .order("hole_number");
      
      // Combine hole data with scores
      const holeDataWithScores: HoleData[] = [];
      
      for (let i = 1; i <= roundData.hole_count; i++) {
        const scoreData = holeScoresData?.find(s => s.hole_number === i);
        const holeInfo = courseHolesData?.find(h => h.hole_number === i);
        
        if (scoreData) {
          holeDataWithScores.push({
            holeNumber: i,
            par: holeInfo?.par || 4,
            distance: 0, // Not showing distance in review
            score: scoreData.score || 0,
            putts: scoreData.putts || 0,
            fairwayHit: scoreData.fairway_hit || false,
            greenInRegulation: scoreData.green_in_regulation || false,
          });
        }
      }
      
      setHoleScores(holeDataWithScores);
      
      // Calculate stats
      if (holeDataWithScores.length > 0) {
        // Filter out par 3s for fairway calculation
        const fairwayEligibleHoles = holeDataWithScores.filter(h => h.par && h.par > 3);
        const fairwaysHit = fairwayEligibleHoles.filter(h => h.fairwayHit).length;
        const fairwayEligibleCount = fairwayEligibleHoles.length;
        const totalScore = holeDataWithScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
        const totalPutts = holeDataWithScores.reduce((sum, hole) => sum + (hole.putts || 0), 0);
        const greensInRegulation = holeDataWithScores.filter(h => h.greenInRegulation).length;
        const parTotal = holeDataWithScores.reduce((sum, hole) => sum + (hole.par || 0), 0);
        
        setRoundStats({
          totalScore,
          totalPutts,
          fairwaysHit,
          greensInRegulation,
          totalHoles: holeDataWithScores.length,
          parTotal,
          courseName: courseData?.name || "Unknown Course",
          date: new Date(roundData.date).toLocaleDateString(),
          fairwayEligibleHoles: fairwayEligibleCount
        });
      }
    } catch (error) {
      console.error("Error loading round data:", error);
      toast({
        title: "Error loading round",
        description: "Could not load round information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, holeScores, roundStats };
};
