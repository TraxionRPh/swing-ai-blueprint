
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Course, HoleData, Round, RoundStatus } from "@/types/round-tracking";

export const useRoundTracking = (roundId?: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<RoundStatus>("idle");
  const [round, setRound] = useState<Round | null>(null);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [currentHole, setCurrentHole] = useState(1);
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch round data
  const fetchRound = useCallback(async (id: string) => {
    try {
      setStatus("loading");
      console.log(`Fetching round ${id}`);

      const { data, error } = await supabase
        .from("rounds")
        .select(`
          *,
          golf_courses:course_id (
            id, name, city, state, total_par, is_verified,
            course_tees (*),
            course_holes (*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching round:", error);
        setError(error.message);
        setStatus("error");
        return;
      }

      if (!data) {
        setError("Round not found");
        setStatus("error");
        return;
      }

      console.log("Round data:", data);
      setRound({
        ...data,
        course: data.golf_courses
      });
      setCourse(data.golf_courses);
      setSelectedTeeId(data.tee_id || null);
      setStatus("success");

      // Fetch hole scores for this round
      fetchHoleScores(id);
    } catch (err) {
      console.error("Exception in fetchRound:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }, []);

  // Fetch hole scores for a round
  const fetchHoleScores = useCallback(async (roundId: string) => {
    try {
      console.log(`Fetching hole scores for round ${roundId}`);
      const { data, error } = await supabase
        .from("hole_scores")
        .select("*")
        .eq("round_id", roundId)
        .order("hole_number");

      if (error) {
        console.error("Error fetching hole scores:", error);
        setError(error.message);
        return;
      }

      console.log(`Found ${data?.length || 0} hole scores`);
      
      // Create or merge hole scores with course hole data
      if (round && round.course && round.course.course_holes) {
        const holeCount = round.hole_count || 18;
        const formattedScores = formatHoleScores(data, round.course.course_holes, holeCount);
        setHoleScores(formattedScores);
      } else {
        // Initialize with default values if no course holes data
        const defaultScores = initializeDefaultScores(round?.hole_count || 18);
        
        // Merge with any existing scores
        if (data && data.length > 0) {
          data.forEach((holeScore) => {
            const index = holeScore.hole_number - 1;
            if (index >= 0 && index < defaultScores.length) {
              defaultScores[index] = {
                ...defaultScores[index],
                score: holeScore.score || 0,
                putts: holeScore.putts || 0,
                fairwayHit: !!holeScore.fairway_hit,
                greenInRegulation: !!holeScore.green_in_regulation
              };
            }
          });
        }
        
        setHoleScores(defaultScores);
      }
    } catch (err) {
      console.error("Exception in fetchHoleScores:", err);
    }
  }, [round]);

  // Format hole scores, combining hole info with scores
  const formatHoleScores = (scores: any[], holeInfo: any[], holeCount: number = 18): HoleData[] => {
    return Array.from({ length: holeCount }, (_, i) => {
      const holeNumber = i + 1;
      const existingHole = scores?.find(h => h.hole_number === holeNumber);
      const courseHole = holeInfo?.find(h => h.hole_number === holeNumber);
      
      return {
        holeNumber: holeNumber,
        par: courseHole?.par || 4,
        distance: courseHole?.distance_yards || 0,
        score: existingHole?.score || 0,
        putts: existingHole?.putts || 0,
        fairwayHit: !!existingHole?.fairway_hit,
        greenInRegulation: !!existingHole?.green_in_regulation
      };
    });
  };

  // Initialize default scores
  const initializeDefaultScores = (holeCount: number = 18): HoleData[] => {
    return Array.from({ length: holeCount }, (_, i) => ({
      holeNumber: i + 1,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }));
  };

  // Save hole score
  const saveHoleScore = useCallback(async (holeData: HoleData) => {
    if (!round?.id) {
      console.error('Cannot save hole score: No round ID');
      return false;
    }
    
    try {
      setStatus("saving");
      console.log(`Saving hole ${holeData.holeNumber} score:`, holeData);
      
      const { error } = await supabase
        .from("hole_scores")
        .upsert({
          round_id: round.id,
          hole_number: holeData.holeNumber,
          score: holeData.score || null,
          putts: holeData.putts || null,
          fairway_hit: !!holeData.fairwayHit,
          green_in_regulation: !!holeData.greenInRegulation
        }, {
          onConflict: 'round_id,hole_number'
        });

      if (error) {
        console.error("Error saving hole score:", error);
        toast({
          title: "Error",
          description: `Failed to save score: ${error.message}`,
          variant: "destructive"
        });
        setStatus("error");
        setError(error.message);
        return false;
      }

      // Update local state
      const updatedScores = [...holeScores];
      const index = updatedScores.findIndex(h => h.holeNumber === holeData.holeNumber);
      if (index !== -1) {
        updatedScores[index] = holeData;
      } else {
        updatedScores.push(holeData);
      }
      setHoleScores(updatedScores);
      
      toast({
        title: "Score saved",
        description: `Hole ${holeData.holeNumber} score saved successfully`,
      });
      
      setStatus("success");
      return true;
    } catch (err) {
      console.error("Exception in saveHoleScore:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    }
  }, [round, holeScores, toast]);

  // Update current hole score
  const updateHoleScore = useCallback((holeData: HoleData) => {
    const updatedScores = [...holeScores];
    const index = updatedScores.findIndex(h => h.holeNumber === holeData.holeNumber);
    if (index !== -1) {
      updatedScores[index] = holeData;
    } else {
      updatedScores.push(holeData);
    }
    setHoleScores(updatedScores);
  }, [holeScores]);

  // Navigate to next hole
  const nextHole = useCallback(async () => {
    if (currentHole >= (round?.hole_count || 18)) return;
    
    // Save current hole data first
    const currentHoleData = holeScores.find(h => h.holeNumber === currentHole);
    if (currentHoleData) {
      await saveHoleScore(currentHoleData);
    }
    
    const nextHoleNum = currentHole + 1;
    setCurrentHole(nextHoleNum);
    
    // Update URL if we have a round ID
    if (round?.id) {
      navigate(`/rounds/${round.id}/${nextHoleNum}`);
    }
  }, [currentHole, round, holeScores, saveHoleScore, navigate]);

  // Navigate to previous hole
  const previousHole = useCallback(() => {
    if (currentHole <= 1) return;
    
    const prevHoleNum = currentHole - 1;
    setCurrentHole(prevHoleNum);
    
    // Update URL if we have a round ID
    if (round?.id) {
      navigate(`/rounds/${round.id}/${prevHoleNum}`);
    }
  }, [currentHole, round, navigate]);

  // Select course and tee for a new round
  const selectCourseAndTee = useCallback(async (courseId: string, teeId: string | null, holeCount: number = 18) => {
    try {
      setStatus("loading");
      
      // Fetch the course data
      const { data: courseData, error: courseError } = await supabase
        .from("golf_courses")
        .select(`
          *,
          course_tees (*),
          course_holes (*)
        `)
        .eq("id", courseId)
        .single();
        
      if (courseError) {
        console.error("Error fetching course:", courseError);
        setError(courseError.message);
        setStatus("error");
        return null;
      }
      
      setCourse(courseData);
      setSelectedTeeId(teeId);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to start a round",
          variant: "destructive"
        });
        setStatus("error");
        setError("Authentication required");
        return null;
      }
      
      // Create a new round
      const { data: newRound, error: roundError } = await supabase
        .from("rounds")
        .insert({
          course_id: courseId,
          tee_id: teeId,
          user_id: user.id,
          hole_count: holeCount,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
        
      if (roundError) {
        console.error("Error creating round:", roundError);
        toast({
          title: "Error",
          description: `Failed to create round: ${roundError.message}`,
          variant: "destructive"
        });
        setStatus("error");
        setError(roundError.message);
        return null;
      }
      
      console.log("Created new round:", newRound);
      setRound({
        ...newRound,
        course: courseData
      });
      
      // Initialize hole scores
      const initialScores = initializeDefaultScores(holeCount);
      if (courseData.course_holes && courseData.course_holes.length > 0) {
        courseData.course_holes.forEach(hole => {
          const index = hole.hole_number - 1;
          if (index >= 0 && index < initialScores.length) {
            initialScores[index] = {
              ...initialScores[index],
              par: hole.par || 4,
              distance: hole.distance_yards || 0
            };
          }
        });
      }
      setHoleScores(initialScores);
      
      setCurrentHole(1);
      setStatus("success");
      
      toast({
        title: "Round started",
        description: `New round at ${courseData.name} created`
      });
      
      // Navigate to the new round
      navigate(`/rounds/${newRound.id}/1`);
      
      return newRound.id;
    } catch (err) {
      console.error("Exception in selectCourseAndTee:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, [navigate, toast]);

  // Fetch recent courses for selection
  const fetchRecentCourses = useCallback(async () => {
    try {
      setStatus("loading");
      const { data, error } = await supabase
        .from("rounds")
        .select(`
          course_id,
          hole_count,
          golf_courses!inner (
            id, name, city, state, is_verified,
            course_tees (*)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (error) {
        console.error("Error fetching recent courses:", error);
        return [];
      }
      
      // Filter unique courses
      const uniqueCourses = data
        ?.map(round => ({
          ...round.golf_courses,
          hole_count: round.hole_count || 18
        }))
        .filter((course, index, self) => 
          course && self.findIndex(c => c?.id === course.id) === index
        );
        
      setStatus("success");
      return uniqueCourses || [];
    } catch (err) {
      console.error("Exception in fetchRecentCourses:", err);
      return [];
    }
  }, []);

  // Search for courses
  const searchCourses = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      setStatus("loading");
      const { data, error } = await supabase
        .from("golf_courses")
        .select(`
          *,
          course_tees (*)
        `)
        .or(
          `name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`
        )
        .limit(10);
        
      if (error) {
        console.error("Error searching courses:", error);
        return [];
      }
      
      setStatus("success");
      return data || [];
    } catch (err) {
      console.error("Exception in searchCourses:", err);
      return [];
    }
  }, []);

  // Finish round
  const finishRound = useCallback(async () => {
    if (!round?.id) return false;
    
    try {
      setStatus("saving");
      
      // Save all hole scores first
      for (const holeData of holeScores) {
        if (holeData.score > 0) {
          await saveHoleScore(holeData);
        }
      }
      
      // Calculate totals
      const totalScore = holeScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
      const totalPutts = holeScores.reduce((sum, hole) => sum + (hole.putts || 0), 0);
      const fairwaysHit = holeScores.reduce((sum, hole) => sum + (hole.fairwayHit ? 1 : 0), 0);
      const greensInRegulation = holeScores.reduce((sum, hole) => sum + (hole.greenInRegulation ? 1 : 0), 0);
      
      // Update round with totals
      const { error } = await supabase
        .from("rounds")
        .update({
          total_score: totalScore > 0 ? totalScore : null,
          total_putts: totalPutts > 0 ? totalPutts : null,
          fairways_hit: fairwaysHit,
          greens_in_regulation: greensInRegulation,
          updated_at: new Date().toISOString()
        })
        .eq("id", round.id);
        
      if (error) {
        console.error("Error updating round:", error);
        toast({
          title: "Error",
          description: `Failed to finish round: ${error.message}`,
          variant: "destructive"
        });
        setStatus("error");
        setError(error.message);
        return false;
      }
      
      setStatus("success");
      toast({
        title: "Round complete",
        description: `Your round has been completed and saved`
      });
      
      // Navigate to the summary screen
      navigate(`/rounds`);
      
      return true;
    } catch (err) {
      console.error("Exception in finishRound:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    }
  }, [round, holeScores, saveHoleScore, navigate, toast]);

  // Initialize by fetching round data if ID is provided
  useEffect(() => {
    if (roundId) {
      fetchRound(roundId);
    } else {
      setStatus("idle");
    }
  }, [roundId, fetchRound]);

  // Listen to URL params for hole number
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/rounds\/[^/]+\/(\d+)$/);
    if (match && match[1]) {
      const holeNum = parseInt(match[1]);
      if (!isNaN(holeNum) && holeNum > 0 && holeNum <= (round?.hole_count || 18)) {
        setCurrentHole(holeNum);
      }
    }
  }, [round, window.location.pathname]);

  return {
    status,
    round,
    holeScores,
    currentHole,
    course,
    selectedTeeId,
    error,
    
    // Actions
    fetchRound,
    updateHoleScore,
    saveHoleScore,
    nextHole,
    previousHole,
    selectCourseAndTee,
    fetchRecentCourses,
    searchCourses,
    finishRound,
    
    // Current hole data for convenient access
    currentHoleData: holeScores.find(h => h.holeNumber === currentHole) || {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }
  };
};
