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
            id, name, city, state, total_par, is_verified
          ),
          course_tees:tee_id (*)
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
      
      // Get course tees separately to avoid relationship issues
      const { data: courseTees, error: teesError } = await supabase
        .from("course_tees")
        .select("*")
        .eq("course_id", data.course_id);
        
      if (teesError) {
        console.error("Error fetching course tees:", teesError);
      }
      
      // Get course holes separately
      const { data: courseHoles, error: holesError } = await supabase
        .from("course_holes")
        .select("*")
        .eq("course_id", data.course_id)
        .order("hole_number");
        
      if (holesError) {
        console.error("Error fetching course holes:", holesError);
      }
        
      // Construct the full course object with all relationships
      const fullCourse: Course = {
        id: data.golf_courses.id,
        name: data.golf_courses.name,
        city: data.golf_courses.city,
        state: data.golf_courses.state,
        total_par: data.golf_courses.total_par,
        is_verified: data.golf_courses.is_verified,
        course_tees: Array.isArray(courseTees) ? courseTees : [],
        course_holes: Array.isArray(courseHoles) ? courseHoles : []
      };
      
      setRound({
        ...data,
        course: fullCourse
      });
      
      setCourse(fullCourse);
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
      
      // Get course hole data separately if needed
      let courseHoles: any[] = [];
      if (round?.course_id) {
        const { data: holes } = await supabase
          .from("course_holes")
          .select("*")
          .eq("course_id", round.course_id)
          .order("hole_number");
          
        if (holes) {
          courseHoles = holes;
        }
      }
      
      // Create or merge hole scores with course hole data
      const holeCount = round?.hole_count || 18;
      const formattedScores = formatHoleScores(data || [], courseHoles, holeCount);
      setHoleScores(formattedScores);
      
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
      
      // Fetch the course data with proper relationships
      const { data: courseData, error: courseError } = await supabase
        .from("golf_courses")
        .select(`
          id, name, city, state, total_par, is_verified
        `)
        .eq("id", courseId)
        .single();
        
      if (courseError) {
        console.error("Error fetching course:", courseError);
        setError(courseError.message);
        setStatus("error");
        return null;
      }
      
      // Fetch course tees separately
      const { data: courseTees, error: teesError } = await supabase
        .from("course_tees")
        .select("*")
        .eq("course_id", courseId);
        
      if (teesError) {
        console.error("Error fetching course tees:", teesError);
      }
      
      // Fetch course holes separately  
      const { data: courseHoles, error: holesError } = await supabase
        .from("course_holes")
        .select("*")
        .eq("course_id", courseId)
        .order("hole_number");
        
      if (holesError) {
        console.error("Error fetching course holes:", holesError);
      }
      
      // Create the complete course object
      const fullCourse: Course = {
        ...courseData,
        course_tees: Array.isArray(courseTees) ? courseTees : [],
        course_holes: Array.isArray(courseHoles) ? courseHoles : []
      };
      
      setCourse(fullCourse);
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
        course: fullCourse
      });
      
      // Initialize hole scores
      const initialScores = initializeDefaultScores(holeCount);
      if (fullCourse.course_holes && fullCourse.course_holes.length > 0) {
        fullCourse.course_holes.forEach(hole => {
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
        description: `New round at ${fullCourse.name} created`
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
      const { data: courseData, error } = await supabase
        .from("golf_courses")
        .select(`
          id, name, city, state, is_verified, total_par,
          course_tees (*)
        `)
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (error) {
        console.error("Error fetching recent courses:", error);
        return [];
      }
      
      // Transform data to match Course type
      const courses: Course[] = (courseData || []).map(c => ({
        id: c.id,
        name: c.name,
        city: c.city,
        state: c.state,
        total_par: c.total_par,
        is_verified: c.is_verified,
        // Ensure course_tees is always an array
        course_tees: Array.isArray(c.course_tees) ? c.course_tees : [],
        // Add empty course_holes array
        course_holes: []
      }));
        
      setStatus("success");
      return courses;
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
      const { data: courseData, error } = await supabase
        .from("golf_courses")
        .select(`
          id, name, city, state, is_verified, total_par,
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
      
      // Transform data to match Course type
      const courses: Course[] = (courseData || []).map(c => ({
        id: c.id,
        name: c.name,
        city: c.city,
        state: c.state,
        total_par: c.total_par,
        is_verified: c.is_verified,
        // Ensure course_tees is always an array
        course_tees: Array.isArray(c.course_tees) ? c.course_tees : [],
        // Add empty course_holes array
        course_holes: []
      }));
      
      setStatus("success");
      return courses;
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
  }, [round]);

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
    updateHoleScore: () => {}, // Add stub implementation
    saveHoleScore: async () => false, // Add stub implementation
    nextHole: () => {}, // Add stub implementation
    previousHole: () => {}, // Add stub implementation
    selectCourseAndTee: async () => null, // Add stub implementation
    fetchRecentCourses,
    searchCourses,
    finishRound: async () => false, // Add stub implementation
    
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
