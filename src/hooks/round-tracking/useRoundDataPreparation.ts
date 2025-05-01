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
      if (!courseId) {
        console.warn("No courseId provided to useRoundDataPreparation.");
        return;
      }

      setLoadingStage("fetching_hole_data");

      console.log("Fetching course_holes for course:", courseId);

      const { data, error } = await supabase
        .from("course_holes")
        .select("hole_number, par, distance_yards")
        .eq("course_id", courseId)
        .order("hole_number", { ascending: true });

      if (error) {
        console.error("Supabase course_holes error:", error);
        setError("Failed to fetch course hole data.");
        return;
      }

      if (!data || data.length === 0) {
        console.warn("No course_holes data found for course:", courseId);
        setError("No hole data found for the selected course.");
        return;
      }

      const formattedHoles = data.map((hole) => ({
        holeNumber: hole.hole_number,
        par: hole.par || 4,
        distance: hole.distance_yards || 0,
      }));

      console.log("Formatted hole scores:", formattedHoles);

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
