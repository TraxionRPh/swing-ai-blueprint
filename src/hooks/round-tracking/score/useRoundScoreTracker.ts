
import { useState, useCallback, useEffect } from "react";
import { useHoleNavigation } from "./useHoleNavigation";
import { useHolePersistence } from "./useHolePersistence";
import { useHoleScores } from "./useHoleScores";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHoleDataFetcher } from "./use-hole-data-fetcher"; 
import type { HoleData } from "@/types/round-tracking";

export const useRoundScoreTracker = (
  roundId: string | null,
  courseId?: string,
  teeId?: string
) => {
  const { currentHole, setCurrentHole, handleNext, handlePrevious } = useHoleNavigation();
  const { saveHoleScore, isSaving, saveSuccess, saveError } = useHolePersistence(roundId);
  const { holeScores, setHoleScores } = useHoleScores(roundId);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { fetchHoleScoresFromRound, fetchHoleScoresFromCourse, fetchCourseHolesData } = useHoleDataFetcher();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        console.log(`🔍 Fetching hole data: roundId=${roundId}, courseId=${courseId}, teeId=${teeId}`);
        
        if (roundId === "new") {
          if (!courseId) {
            console.warn("❌ New round started but no courseId was provided.");
            toast({
              title: "Missing Course",
              description: "Please select a course to begin the round.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }

          console.log("🟢 New round - loading course hole data...");
          const holeData = await fetchHoleScoresFromCourse(courseId, teeId || undefined);
          setHoleScores(holeData);
          setIsLoading(false);
          return;
        }

        if (roundId && roundId !== "new") {
          console.log("📥 Fetching existing round data...");
          const result = await fetchHoleScoresFromRound(roundId);
          if (result?.formattedScores) {
            setHoleScores(result.formattedScores);
          } else {
            console.warn("⚠️ No scores returned for round:", roundId);
          }
        } else if (courseId) {
          console.log("🟡 No roundId, but courseId present — fallback to course hole data");
          const holeData = await fetchHoleScoresFromCourse(courseId, teeId || undefined);
          setHoleScores(holeData);
        } else {
          console.warn("❌ No valid roundId or courseId provided. Showing default empty holes.");
        }
      } catch (error) {
        console.error("❌ Error fetching hole data:", error);
        toast({
          title: "Error loading hole data",
          description: "Could not load hole scores. Using default values.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roundId, courseId, teeId, fetchHoleScoresFromRound, fetchHoleScoresFromCourse, fetchCourseHolesData, setHoleScores, toast]);

  const currentHoleData = holeScores.find(hole => hole.holeNumber === currentHole) || {
    holeNumber: currentHole,
    par: 4,
    distance: 0,
    score: 0,
    putts: undefined, // Ensure putts is undefined by default
    fairwayHit: false,
    greenInRegulation: false
  };

  const handleHoleUpdate = useCallback((data: HoleData) => {
    const updatedScores = [...holeScores];
    const holeIndex = updatedScores.findIndex(hole => hole.holeNumber === data.holeNumber);
    
    if (holeIndex >= 0) {
      updatedScores[holeIndex] = data;
    } else {
      updatedScores.push(data);
    }
    
    setHoleScores(updatedScores);

    if (roundId && roundId !== 'new') {
      saveHoleScore(data);
    }
  }, [holeScores, setHoleScores, roundId, saveHoleScore]);

  const clearResumeData = useCallback(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
  }, []);

  return {
    currentHole,
    setCurrentHole,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    saveSuccess,
    saveError,
    isLoading,
    currentHoleData,
    clearResumeData,
    fetchCourseHoles: fetchCourseHolesData,
  };
};
