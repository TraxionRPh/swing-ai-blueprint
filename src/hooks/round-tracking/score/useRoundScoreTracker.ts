import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

export const useRoundScoreTracker = (roundId: string | null, courseId?: string) => {
  // State management
  const [currentHole, setCurrentHole] = useState(1);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [courseHolesLoaded, setCourseHolesLoaded] = useState(false);

  // Hooks
  const { holeNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const didInitialize = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the hole number from URL params
  useEffect(() => {
    if (didInitialize.current) return;
    didInitialize.current = true;
    
    console.log("Initializing hole navigation, URL param:", holeNumber);
    
    // Handle URL param if provided (highest priority)
    if (holeNumber && !isNaN(Number(holeNumber))) {
      console.log("Using hole number from URL:", holeNumber);
      setCurrentHole(Number(holeNumber));
      return;
    }
    
    // Check for resume data in session storage (second priority)
    const resumeHoleNumber = sessionStorage.getItem('resume-hole-number');
    if (resumeHoleNumber && !isNaN(Number(resumeHoleNumber))) {
      console.log("Using hole number from session storage:", resumeHoleNumber);
      setCurrentHole(Number(resumeHoleNumber));
      return;
    }
    
    // Default to hole 1 if no specific instructions
    console.log("No hole number in URL or session, defaulting to hole 1");
    setCurrentHole(1);
  }, [holeNumber]);

  // Fetch hole scores when roundId changes
  useEffect(() => {
    if (!roundId || roundId === 'new') return;
    
    const fetchHoleScores = async () => {
      try {
        console.log("Fetching hole scores for round:", roundId);
        const { data, error } = await supabase
          .from('hole_scores')
          .select('*')
          .eq('round_id', roundId)
          .order('hole_number');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log(`Found ${data.length} hole scores for round ${roundId}`);
          const formattedScores = formatHoleData(data);
          setHoleScores(formattedScores);
          
          // Fetch course hole data to merge with scores
          if (courseId) {
            fetchCourseHoles();
          }
        } else {
          console.log("No hole scores found, initializing default");
          // Only initialize if we haven't loaded course holes
          if (!courseHolesLoaded && courseId) {
            fetchCourseHoles();
          } else {
            initializeDefaultScores();
          }
        }
      } catch (error) {
        console.error("Error fetching hole scores:", error);
        toast({
          title: "Error loading scores",
          description: "Could not load your saved scores. Starting with empty scorecard.",
          variant: "destructive"
        });
        initializeDefaultScores();
      }
    };
    
    fetchHoleScores();
  }, [roundId, toast]);

  // Fetch course hole data when courseId changes
  const fetchCourseHoles = useCallback(async () => {
    if (!courseId) return;
    
    try {
      console.log("Fetching hole data for course:", courseId);
      const { data, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} holes for course ${courseId}`);
        
        // If we already have hole scores, merge the course hole data with them
        if (holeScores.length > 0) {
          const mergedScores = mergeCourseDataWithScores(data, holeScores);
          setHoleScores(mergedScores);
        } else {
          // Otherwise just populate with course data
          const prepopulatedScores = prepopulateFromCourseData(data);
          setHoleScores(prepopulatedScores);
        }
        
        setCourseHolesLoaded(true);
      } else {
        console.log("No course holes found, using default values");
        if (holeScores.length === 0) {
          initializeDefaultScores();
        }
      }
    } catch (error) {
      console.error("Error fetching course holes:", error);
      if (holeScores.length === 0) {
        initializeDefaultScores();
      }
    }
  }, [courseId, holeScores]);

  // Watch for course ID changes
  useEffect(() => {
    if (courseId && !courseHolesLoaded) {
      fetchCourseHoles();
    }
  }, [courseId, courseHolesLoaded, fetchCourseHoles]);

  // Save hole score data with debounce
  const saveHoleScore = useCallback(async (holeData: HoleData) => {
    if (!roundId || roundId === 'new' || !holeData.holeNumber) {
      console.log("Not saving - invalid round ID or hole number");
      return Promise.resolve(false);
    }
    
    // Cancel any pending save operations
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Create a promise that resolves when the save is complete
    return new Promise<boolean>((resolve) => {
      // Set up a new save operation with 800ms debounce
      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          console.log(`Saving hole ${holeData.holeNumber} data for round ${roundId}`);
          
          const { error } = await supabase
            .from('hole_scores')
            .upsert({
              round_id: roundId,
              hole_number: holeData.holeNumber,
              score: holeData.score || null,
              putts: holeData.putts || null,
              fairway_hit: Boolean(holeData.fairwayHit),
              green_in_regulation: Boolean(holeData.greenInRegulation)
            }, {
              onConflict: 'round_id,hole_number'
            });
  
          if (error) throw error;
          
          console.log(`Successfully saved hole ${holeData.holeNumber} data`);
          resolve(true);
        } catch (error: any) {
          console.error('Error saving hole score:', error);
          toast({
            title: "Error saving hole score",
            description: error.message || "Could not save your progress. Please try again.",
            variant: "destructive"
          });
          resolve(false);
        } finally {
          setIsSaving(false);
        }
      }, 800); // 800ms debounce
    });
  }, [roundId, toast]);

  // Save course hole data (par and distance)
  const saveCourseHoleData = useCallback(async (holeData: HoleData) => {
    if (!courseId || !holeData.holeNumber) {
      console.log("Not saving course hole - invalid course ID or hole number");
      return Promise.resolve(false);
    }
    
    try {
      console.log(`Saving course hole ${holeData.holeNumber} data for course ${courseId}`);
      
      const { error } = await supabase
        .from('course_holes')
        .upsert({
          course_id: courseId,
          hole_number: holeData.holeNumber,
          par: holeData.par || 4,
          distance_yards: holeData.distance || 0
        }, {
          onConflict: 'course_id,hole_number'
        });

      if (error) throw error;
      
      console.log(`Successfully saved course hole ${holeData.holeNumber} data`);
      return true;
    } catch (error: any) {
      console.error('Error saving course hole data:', error);
      toast({
        title: "Error saving course data",
        description: error.message || "Could not save course information. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [courseId, toast]);

  // Create memoized current hole data
  const currentHoleData = useMemo(() => {
    // First try to find the exact hole in the scores array
    const exactHole = holeScores.find(hole => hole.holeNumber === currentHole);
    if (exactHole) {
      return exactHole;
    }
    
    // If not found, create default data for the current hole
    return {
      holeNumber: currentHole,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
  }, [holeScores, currentHole, lastUpdated]);

  // Handle updating a hole's score data
  const handleHoleUpdate = useCallback((data: HoleData) => {
    console.log('Updating hole data:', data);
    
    // Update the hole scores array
    const updatedScores = [...holeScores];
    const holeIndex = updatedScores.findIndex(hole => hole.holeNumber === data.holeNumber);
    
    if (holeIndex >= 0) {
      // Update existing hole
      updatedScores[holeIndex] = data;
    } else {
      // Add new hole
      updatedScores.push(data);
    }
    
    // Update state
    setHoleScores(updatedScores);
    setLastUpdated(Date.now());
    
    // Trigger save if we have a valid round ID
    if (roundId && roundId !== 'new') {
      saveHoleScore(data);
    }
    
    // Save course hole data if updating par or distance
    if (courseId && (data.par || data.distance)) {
      saveCourseHoleData(data);
    }
  }, [holeScores, roundId, courseId, saveHoleScore, saveCourseHoleData]);

  // Navigate to next hole
  const handleNext = useCallback(() => {
    const nextHole = currentHole + 1;
    if (nextHole <= 18) {
      console.log(`Moving to next hole: ${nextHole}`);
      
      // Always save current data before navigating
      const currentData = currentHoleData;
      if (roundId && roundId !== 'new' && currentData) {
        saveHoleScore(currentData);
      }
      
      // Update session storage and URL
      sessionStorage.setItem('resume-hole-number', nextHole.toString());
      
      if (roundId) {
        navigate(`/rounds/${roundId}/${nextHole}`);
      }
      
      setCurrentHole(nextHole);
    }
  }, [currentHole, currentHoleData, navigate, roundId, saveHoleScore]);

  // Navigate to previous hole
  const handlePrevious = useCallback(() => {
    const prevHole = currentHole - 1;
    if (prevHole >= 1) {
      console.log(`Moving to previous hole: ${prevHole}`);
      
      // Always save current data before navigating
      const currentData = currentHoleData;
      if (roundId && roundId !== 'new' && currentData) {
        saveHoleScore(currentData);
      }
      
      // Update session storage and URL
      sessionStorage.setItem('resume-hole-number', prevHole.toString());
      
      if (roundId) {
        navigate(`/rounds/${roundId}/${prevHole}`);
      }
      
      setCurrentHole(prevHole);
    }
  }, [currentHole, currentHoleData, navigate, roundId, saveHoleScore]);
  
  // Set hole directly (for jumps)
  const setHole = useCallback((holeNumber: number) => {
    if (holeNumber >= 1 && holeNumber <= 18) {
      console.log(`Directly setting hole to: ${holeNumber}`);
      
      // Always save current data before navigating
      const currentData = currentHoleData;
      if (roundId && roundId !== 'new' && currentData) {
        saveHoleScore(currentData);
      }
      
      // Update session storage and URL
      sessionStorage.setItem('resume-hole-number', holeNumber.toString());
      
      if (roundId) {
        navigate(`/rounds/${roundId}/${holeNumber}`);
      }
      
      setCurrentHole(holeNumber);
    }
  }, [currentHoleData, navigate, roundId, saveHoleScore]);

  // Clear resume data on round completion or cancel
  const clearResumeData = useCallback(() => {
    sessionStorage.removeItem('resume-hole-number');
    localStorage.removeItem('resume-hole-number');
    sessionStorage.removeItem('force-resume');
    console.log("Resume data cleared");
  }, []);

  // Helper functions
  const formatHoleData = (dbScores: any[]): HoleData[] => {
    return dbScores.map(score => ({
      holeNumber: score.hole_number,
      par: 4, // Default to par 4 if not provided
      distance: 0,
      score: score.score || 0,
      putts: score.putts || 0,
      fairwayHit: score.fairway_hit || false,
      greenInRegulation: score.green_in_regulation || false
    }));
  };

  const prepopulateFromCourseData = (courseHoles: any[]): HoleData[] => {
    return courseHoles.map(hole => ({
      holeNumber: hole.hole_number,
      par: hole.par || 4,
      distance: hole.distance_yards || 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }));
  };

  const mergeCourseDataWithScores = (courseHoles: any[], currentScores: HoleData[]): HoleData[] => {
    // First create a map of existing scores by hole number
    const scoresByHole: Record<number, HoleData> = {};
    currentScores.forEach(score => {
      scoresByHole[score.holeNumber] = score;
    });
    
    // Then merge course data with existing scores or create new ones
    return courseHoles.map(hole => {
      const existingScore = scoresByHole[hole.hole_number];
      
      if (existingScore) {
        // Merge course data with existing score data
        return {
          ...existingScore,
          // Only use course data for par and distance if they're not already set
          par: existingScore.par || hole.par || 4,
          distance: existingScore.distance || hole.distance_yards || 0
        };
      } else {
        // Create new score data from course hole
        return {
          holeNumber: hole.hole_number,
          par: hole.par || 4,
          distance: hole.distance_yards || 0,
          score: 0,
          putts: 0,
          fairwayHit: false,
          greenInRegulation: false
        };
      }
    });
  };

  const initializeDefaultScores = (holeCount: number = 18) => {
    const defaultScores = Array.from({ length: holeCount }, (_, i) => ({
      holeNumber: i + 1,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }));
    setHoleScores(defaultScores);
  };

  return {
    currentHole,
    setCurrentHole: setHole,
    holeScores,
    setHoleScores,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    isSaving,
    currentHoleData,
    clearResumeData,
    fetchCourseHoles
  };
};
