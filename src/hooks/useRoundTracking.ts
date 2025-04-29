
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Course, HoleData, CourseTee } from "@/types/round-tracking";

export interface RoundTracking {
  selectedCourse: Course | null;
  selectedTee: string | null;
  currentTeeColor: string | null;
  currentHole: number;
  holeCount: number;
  holeScores: HoleData[];
  roundsById: Record<string, any>;
  currentRoundId: string | null;
  isLoading: boolean;
  currentHoleData: HoleData | null;
  isSaving: boolean;
  handleCourseSelect: (course: Course) => Promise<string>;
  handleTeeSelect: (teeId: string) => void;
  handleHoleUpdate: (data: HoleData) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  setCurrentRoundId: (id: string | null) => void;
  setHoleCount: (count: number) => void;
  finishRound: () => Promise<void>;
  handleHoleCountSelect: (count: number) => void;
}

export const useRoundTracking = (): RoundTracking => {
  // State variables for tracking rounds and courses
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState<string | null>(null);
  const [currentTeeColor, setCurrentTeeColor] = useState<string | null>(null);
  const [currentHole, setCurrentHole] = useState(1);
  const [holeCount, setHoleCount] = useState(18);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [roundsById, setRoundsById] = useState<Record<string, any>>({});
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  
  // Derived state for current hole data
  const currentHoleData = holeScores.find(h => h.holeNumber === currentHole) || {
    holeNumber: currentHole,
    par: 4,
    distance: 400,
    score: 0,
    putts: 0
  };

  // Handle selecting a course
  const handleCourseSelect = async (course: Course): Promise<string> => {
    setSelectedCourse(course);
    // Additional logic for course selection
    // This would include creating a new round in the database
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          course_id: course.id,
          hole_count: holeCount,
          // Remove is_completed since it's not in the schema
          // Instead, total_score being null can indicate an incomplete round
          total_score: null
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setCurrentRoundId(data.id);
        return data.id;
      }
      
      return "";
    } catch (error) {
      console.error("Error creating round:", error);
      toast({
        title: "Error creating round",
        description: "Please try again",
        variant: "destructive",
      });
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a tee
  const handleTeeSelect = (teeId: string) => {
    setSelectedTee(teeId);
    
    // Update tee color based on selection
    if (selectedCourse?.course_tees) {
      const tee = selectedCourse.course_tees.find(t => t.id === teeId);
      if (tee) {
        setCurrentTeeColor(tee.color);
      }
    }
  };

  // Update hole data
  const handleHoleUpdate = (data: HoleData) => {
    setIsSaving(true);
    
    setHoleScores(prev => {
      const index = prev.findIndex(h => h.holeNumber === data.holeNumber);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = data;
        return updated;
      }
      return [...prev, data];
    });
    
    // Simulate saving to database
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentHole < holeCount) {
      setCurrentHole(prev => prev + 1);
    }
  }, [currentHole, holeCount]);

  const handlePrevious = useCallback(() => {
    if (currentHole > 1) {
      setCurrentHole(prev => prev - 1);
    }
  }, [currentHole]);

  // Handle finishing a round
  const finishRound = async (): Promise<void> => {
    if (!currentRoundId) return;
    
    try {
      setIsSaving(true);
      
      // Calculate total score
      const totalScore = holeScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
      
      const { error } = await supabase
        .from('rounds')
        .update({
          // Use total_score being set to indicate completion
          total_score: totalScore,
          // Store hole_scores in the hole_scores table instead
          // hole_scores: holeScores
        })
        .eq('id', currentRoundId);

      if (error) throw error;
      
      // Now save individual hole scores to the hole_scores table
      for (const holeScore of holeScores) {
        const { error: holeError } = await supabase
          .from('hole_scores')
          .upsert({
            round_id: currentRoundId,
            hole_number: holeScore.holeNumber,
            score: holeScore.score,
            putts: holeScore.putts || 0,
            fairway_hit: holeScore.fairwayHit,
            green_in_regulation: holeScore.greenInRegulation
          }, {
            onConflict: 'round_id,hole_number'
          });
        
        if (holeError) {
          console.error("Error saving hole score:", holeError);
        }
      }
      
      toast({
        title: "Round completed!",
        description: `Total score: ${totalScore}`,
      });
      
      // Reset state after completion
      setSelectedCourse(null);
      setSelectedTee(null);
      setCurrentHole(1);
      setHoleScores([]);
      setCurrentRoundId(null);
    } catch (error) {
      console.error("Error completing round:", error);
      toast({
        title: "Error completing round",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleHoleCountSelect = (count: number) => {
    setHoleCount(count);
  };

  // Load round data when currentRoundId changes
  useEffect(() => {
    if (!currentRoundId) return;
    
    const fetchRoundData = async () => {
      try {
        setIsLoading(true);
        
        // First, get the round data and associated course
        const { data, error } = await supabase
          .from('rounds')
          .select(`
            *,
            golf_courses (
              *,
              course_tees (*)
            )
          `)
          .eq('id', currentRoundId)
          .single();

        if (error) throw error;
        
        if (data) {
          // Store the round data
          setRoundsById(prev => ({
            ...prev,
            [currentRoundId]: data
          }));
          
          // Set up course data
          if (data.golf_courses) {
            setSelectedCourse(data.golf_courses);
            
            // Set hole count
            if (data.hole_count) {
              setHoleCount(data.hole_count);
            }
            
            // Set current hole from resume point or start at 1
            const resumeHole = parseInt(sessionStorage.getItem('resume-hole-number') || '1');
            setCurrentHole(resumeHole);
          }
          
          // Fetch hole scores separately since they're in a different table
          const { data: holeScoresData, error: holeScoresError } = await supabase
            .from('hole_scores')
            .select('*')
            .eq('round_id', currentRoundId);
          
          if (holeScoresError) throw holeScoresError;
          
          if (holeScoresData && Array.isArray(holeScoresData)) {
            // Transform the data to match our expected HoleData format
            const formattedHoleScores: HoleData[] = holeScoresData.map(hs => ({
              holeNumber: hs.hole_number,
              score: hs.score,
              putts: hs.putts || 0,
              // Assuming default values for these if not available
              par: 4, // This should ideally come from course hole data
              distance: 0, // This should ideally come from course hole data
              fairwayHit: hs.fairway_hit,
              greenInRegulation: hs.green_in_regulation
            }));
            
            setHoleScores(formattedHoleScores);
          }
        }
      } catch (error) {
        console.error("Error fetching round:", error);
        toast({
          title: "Error loading round data",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRoundData();
  }, [currentRoundId, toast]);

  // Save current hole to session storage for resuming later
  useEffect(() => {
    if (currentHole > 0 && currentRoundId) {
      sessionStorage.setItem('resume-hole-number', currentHole.toString());
    }
  }, [currentHole, currentRoundId]);

  return {
    selectedCourse,
    selectedTee,
    currentTeeColor,
    currentHole,
    holeCount,
    holeScores,
    roundsById,
    currentRoundId,
    isLoading,
    currentHoleData,
    isSaving,
    handleCourseSelect,
    handleTeeSelect,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    setCurrentRoundId,
    setHoleCount,
    finishRound,
    handleHoleCountSelect,
  };
};
