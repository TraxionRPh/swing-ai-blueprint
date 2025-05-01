import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { HoleData } from "@/types/round-tracking";

/**
 * Unified hook for managing round data including hole scores and course data
 */
export const useRoundData = (roundId: string | null, courseId?: string) => {
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);
  const { toast } = useToast();
  
  // Save queue to handle multiple save operations
  const saveQueue = useRef<Array<{data: HoleData, resolve: Function, reject: Function}>>([]);
  const isSaveInProgress = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Process the save queue
  const processSaveQueue = useCallback(async () => {
    if (isSaveInProgress.current || saveQueue.current.length === 0) return;
    
    isSaveInProgress.current = true;
    const { data, resolve, reject } = saveQueue.current[0];
    
    try {
      console.log('Processing save queue item:', data);
      setIsSaving(true);
      
      if (!roundId) {
        throw new Error('Cannot save hole score: No roundId provided');
      }
      
      // Ensure we have all the required fields for the database
      const dataToSave = {
        round_id: roundId,
        hole_number: data.holeNumber,
        score: data.score || null,
        putts: data.putts || null,
        fairway_hit: !!data.fairwayHit,
        green_in_regulation: !!data.greenInRegulation
      };
      
      // Track time for the save operation
      const startTime = Date.now();
      
      const { error } = await supabase
        .from('hole_scores')
        .upsert(dataToSave, {
          onConflict: 'round_id,hole_number'
        });

      if (error) {
        console.error('Error in supabase upsert:', error);
        throw error;
      }
      
      const saveTime = Date.now() - startTime;
      console.log(`Database save completed in ${saveTime}ms`);
      
      // Only update round summary after successful save of hole data
      await updateRoundSummary(roundId);
      console.log(`Successfully saved hole ${data.holeNumber} data`);
      
      // Show toast to confirm save
      toast({
        title: "Score Saved",
        description: `Hole ${data.holeNumber} data saved successfully`,
        variant: "default"
      });
      
      // Verify data was saved by checking the database again
      const { data: verifyData } = await supabase
        .from('hole_scores')
        .select('*')
        .eq('round_id', roundId)
        .eq('hole_number', data.holeNumber)
        .single();
      
      if (verifyData) {
        console.log(`Verified data was saved for hole ${data.holeNumber}:`, verifyData);
      } else {
        console.warn(`Could not verify data was saved for hole ${data.holeNumber}`);
      }
      
      // Resolve the promise to indicate success
      resolve(true);
      
      // Remove the processed item from the queue
      saveQueue.current.shift();
      
      // Reset retry counter after successful save
      retryCount.current = 0;
    } catch (error: any) {
      console.error('Error saving hole score:', error);
      
      // Increment retry count
      retryCount.current++;
      
      if (retryCount.current <= maxRetries) {
        console.log(`Retry attempt ${retryCount.current}/${maxRetries} for hole ${data.holeNumber}`);
        // Keep the item in the queue for retry
      } else {
        console.error(`Max retries reached for hole ${data.holeNumber}, removing from queue`);
        // Remove from queue after max retries
        saveQueue.current.shift();
        // Reset retry counter for next item
        retryCount.current = 0;
        
        // Reject the promise to indicate failure
        reject(error);
        
        toast({
          title: "Error saving hole score",
          description: error.message || "Could not save your progress after multiple attempts.",
          variant: "destructive"
        });
      }
    } finally {
      isSaveInProgress.current = false;
      setIsSaving(false);
      
      // Process next item if any
      setTimeout(() => {
        if (saveQueue.current.length > 0) {
          processSaveQueue();
        }
      }, 500);
    }
  }, [roundId, toast]);

  // Save a hole score with queue management
  const saveHoleScore = useCallback((holeData: HoleData): Promise<boolean> => {
    console.log(`Queueing save for hole ${holeData.holeNumber} data:`, JSON.stringify(holeData));
    
    return new Promise((resolve, reject) => {
      // Add to the save queue
      saveQueue.current.push({
        data: holeData,
        resolve,
        reject
      });
      
      // Process the queue if not already in progress
      if (!isSaveInProgress.current) {
        processSaveQueue();
      }
    });
  }, [processSaveQueue]);

  // Fetch hole scores from database for a round
  const fetchHoleScoresFromRound = useCallback(async (roundId: string) => {
    setIsLoading(true);
    try {
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
      const roundResponse = await supabase
        .from('rounds')
        .select(`
          course_id, 
          hole_count,
          golf_courses (
            id, 
            name, 
            city, 
            state,
            total_par
          )
        `)
        .eq('id', roundId)
        .maybeSingle();
          
      if (roundResponse.error) {
        console.error('Error fetching round data:', roundResponse.error);
        throw roundResponse.error;
      }

      const roundData = roundResponse.data || {};
      const courseId = roundData?.course_id;
      const holeCount = roundData?.hole_count || 18;
      
      // Store the course data for reference
      setCourseData(roundData?.golf_courses || null);
      
      let holeInfo: any[] = [];
      
      if (courseId) {
        try {
          console.log('Fetching course holes for course:', courseId);
          const courseHolesResponse = await supabase
            .from('course_holes')
            .select('*')
            .eq('course_id', courseId)
            .order('hole_number');
            
          if (courseHolesResponse.error) {
            console.error('Error fetching course holes:', courseHolesResponse.error);
            throw courseHolesResponse.error;
          } else {
            holeInfo = courseHolesResponse.data || [];
            console.log('Course holes data:', holeInfo);
          }
        } catch (courseError) {
          console.error('Failed to fetch course holes:', courseError);
        }
      }

      // Format the hole scores with course data
      const formattedScores = formatHoleScores(holeScoresData || [], holeInfo, holeCount);
      console.log('Formatted hole scores with course data:', formattedScores);
      setHoleScores(formattedScores);
      
      // Return hole count and course data
      return { 
        formattedScores,
        holeCount,
        courseData: roundData?.golf_courses
      };
    } catch (error) {
      console.error('Error fetching hole scores from round:', error);
      toast({
        title: "Error loading round data",
        description: "Could not load hole scores. Please try again.",
        variant: "destructive"
      });
      initializeDefaultHoleScores();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch hole data for a course (for new rounds)
  const fetchHoleDataForCourse = useCallback(async (courseId: string) => {
    if (!courseId) return null;
    
    setIsLoading(true);
    try {
      console.log('Fetching course data for:', courseId);
      
      // Get course data first
      const { data: courseData, error: courseError } = await supabase
        .from('golf_courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();
        
      if (courseError) {
        console.error('Error fetching course data:', courseError);
        throw courseError;
      }
      
      // Store course data
      setCourseData(courseData);
      
      // Get hole data for the course
      const { data: courseHoles, error: courseHolesError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
        
      if (courseHolesError) {
        console.error('Error fetching course holes:', courseHolesError);
        throw courseHolesError;
      }
      
      // Format holes from course data
      const holeInfo = courseHoles || [];
      console.log('Course holes data:', holeInfo);
      
      const formattedScores = formatHoleScores([], holeInfo);
      setHoleScores(formattedScores);
      
      return {
        courseData,
        holeInfo,
        formattedScores
      };
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "Error loading course data",
        description: "Could not load course information. Using default values.",
        variant: "destructive"
      });
      initializeDefaultHoleScores();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Format hole scores with course data
  const formatHoleScores = (scores: any[], holeInfo: any[], holeCount: number = 18): HoleData[] => {
    return Array.from({ length: holeCount }, (_, i) => {
      const existingHole = scores.find(h => h.hole_number === i + 1);
      const courseHole = holeInfo.find(h => h.hole_number === i + 1);
      
      return {
        holeNumber: i + 1,
        par: courseHole?.par || 4,
        distance: courseHole?.distance_yards || 0,
        score: existingHole?.score || 0,
        putts: existingHole?.putts || 0,
        fairwayHit: existingHole?.fairway_hit || false,
        greenInRegulation: existingHole?.green_in_regulation || false
      };
    });
  };
  
  // Initialize default hole scores
  const initializeDefaultHoleScores = useCallback((holeCount: number = 18) => {
    const defaultHoles = Array.from({ length: holeCount }, (_, i) => ({
      holeNumber: i + 1,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    }));
    setHoleScores(defaultHoles);
  }, []);
  
  // Update the hole scores data locally
  const updateHoleScoreLocally = useCallback((data: HoleData) => {
    setHoleScores(prevScores => {
      const updatedScores = [...prevScores];
      const holeIndex = updatedScores.findIndex(hole => hole.holeNumber === data.holeNumber);
      
      if (holeIndex >= 0) {
        updatedScores[holeIndex] = data;
      } else {
        updatedScores.push(data);
      }
      
      return updatedScores;
    });
  }, []);
  
  // Handle updating and saving a hole score
  const handleHoleUpdate = useCallback(async (data: HoleData, saveImmediately = true) => {
    console.log('Updating hole data:', data);
    
    // Update local state first
    updateHoleScoreLocally(data);
    
    // Save to database if we have a roundId
    if (roundId && saveImmediately && (data.score > 0 || data.putts > 0)) {
      try {
        await saveHoleScore(data);
      } catch (err) {
        console.error("Error saving hole data:", err);
      }
    }
  }, [roundId, saveHoleScore, updateHoleScoreLocally]);
  
  // Initialize data when component mounts
  useEffect(() => {
    const initializeData = async () => {
      if (roundId) {
        // Load data from an existing round
        await fetchHoleScoresFromRound(roundId);
      } else if (courseId) {
        // Load data from a course (for a new round)
        await fetchHoleDataForCourse(courseId);
      } else {
        // Initialize with default values if no round or course
        initializeDefaultHoleScores();
      }
    };
    
    initializeData();
  }, [roundId, courseId, fetchHoleScoresFromRound, fetchHoleDataForCourse, initializeDefaultHoleScores]);
  
  return {
    holeScores,
    setHoleScores,
    courseData,
    isLoading,
    isSaving,
    saveHoleScore,
    handleHoleUpdate,
    fetchHoleScoresFromRound,
    fetchHoleDataForCourse
  };
};

// Helper function to update the round summary
async function updateRoundSummary(roundId: string) {
  try {
    console.log('Updating round summary for round:', roundId);
    
    const { data: holeScores, error: fetchError } = await supabase
      .from('hole_scores')
      .select('*')
      .eq('round_id', roundId);
      
    if (fetchError) {
      console.error('Error fetching hole scores for summary:', fetchError);
      return;
    }
      
    if (!holeScores || holeScores.length === 0) {
      console.log('No hole scores found for this round');
      return;
    }

    // Calculate totals from all holes, skipping null values
    const totals = holeScores.reduce((acc, hole) => ({
      score: acc.score + (hole.score || 0),
      putts: acc.putts + (hole.putts || 0),
      fairways: acc.fairways + (hole.fairway_hit ? 1 : 0),
      greens: acc.greens + (hole.green_in_regulation ? 1 : 0),
      scoreCount: acc.scoreCount + (hole.score ? 1 : 0),
      puttsCount: acc.puttsCount + (hole.putts ? 1 : 0)
    }), { score: 0, putts: 0, fairways: 0, greens: 0, scoreCount: 0, puttsCount: 0 });
    
    console.log('Calculated round totals:', totals);
    
    // Update the round with the calculated totals
    const updateData: any = {
      fairways_hit: totals.fairways,
      greens_in_regulation: totals.greens,
      updated_at: new Date().toISOString()
    };
    
    // Only set total_score and total_putts if we have complete data
    if (totals.scoreCount > 0) {
      updateData.total_score = totals.score;
    }
    
    if (totals.puttsCount > 0) {
      updateData.total_putts = totals.putts;
    }
    
    const { error: updateError } = await supabase
      .from('rounds')
      .update(updateData)
      .eq('id', roundId);
      
    if (updateError) {
      console.error('Error updating round summary:', updateError);
    } else {
      console.log('Successfully updated round summary');
    }
      
  } catch (error) {
    console.error('Error in updateRoundSummary:', error);
  }
}
