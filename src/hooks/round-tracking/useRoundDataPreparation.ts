import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRoundLoadingState } from "./useRoundLoadingState";

interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
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

  useEffect(() => {
    const fetchHoleData = async () => {
      if (!courseId) return;

      setLoadingStage("fetching_hole_data");

      const { data, error } = await supabase
        .from("course_holes")
        .select("hole_number, par, distance_yards")
        .eq("course_id", courseId)
        .order("hole_number", { ascending: true });

      if (error) {
        console.error("Error fetching course holes:", error);
        setError("Failed to fetch course hole data.");
        return;
      }

      const formattedHoles = data.map((hole) => ({
        holeNumber: hole.hole_number,
        par: hole.par || 4,
        distance: hole.distance_yards || 0,
      }));

      setHoleScores(formattedHoles);
      setLoadingStage("hole_data_ready");
    };

    fetchHoleData();
  }, [courseId, roundId, setLoadingStage, setError]);

  return {
    holeScores,
    setHoleScores,
  };
};
