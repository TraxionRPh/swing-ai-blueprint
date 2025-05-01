
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRoundLoadingState } from "./useRoundLoadingState";

interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  putts: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
}

export const useRoundDataPreparation = ({
  roundId,
  courseId,
  setLoadingStage,
}: {
  roundId: string | null;
  courseId: string | null;
  setLoadingStage: (stage: string) => void;
}) => {
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const { setError } = useRoundLoadingState(roundId);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    const fetchHoleData = async () => {
      if (!courseId) {
        console.log("No courseId provided to useRoundDataPreparation, using default holes");
        // Create default holes even without a course ID
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
        setLoadingStage("hole_data_ready");
        setDataFetched(true);
        return;
      }

      setLoadingStage("fetching_hole_data");

      console.log("Fetching course_holes for course:", courseId);

      try {
        const { data, error } = await supabase
          .from("course_holes")
          .select("hole_number, par, distance_yards")
          .eq("course_id", courseId)
          .order("hole_number", { ascending: true });

        if (error) {
          console.error("Supabase course_holes error:", error);
          setError("Failed to fetch course hole data.");
          
          // Still provide default holes on error
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
        } else if (!data || data.length === 0) {
          console.warn("No course_holes data found for course:", courseId);
          
          // Use default holes if no data found
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
        } else {
          const formattedHoles = data.map((hole) => ({
            holeNumber: hole.hole_number,
            par: hole.par || 4,
            distance: hole.distance_yards || 0,
            score: 0, // Default values for required fields
            putts: 0,
            fairwayHit: false,
            greenInRegulation: false
          }));

          console.log("Formatted hole scores:", formattedHoles);
          setHoleScores(formattedHoles);
        }
      } catch (err) {
        console.error("Exception in fetchHoleData:", err);
        
        // Provide default holes on exception
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
      } finally {
        setLoadingStage("hole_data_ready");
        setDataFetched(true);
      }
    };

    fetchHoleData();
  }, [courseId, roundId, setLoadingStage, setError]);

  return {
    holeScores,
    setHoleScores,
    dataFetched
  };
};
