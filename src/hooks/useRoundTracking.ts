
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export interface CourseTee {
  id: string;
  name: string;
  color: string;
  course_rating: number;
  slope_rating: number;
}

export interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  course_tees: CourseTee[];
}

export interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  putts: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
}

export const useRoundTracking = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState<string | null>(null);
  const [currentHole, setCurrentHole] = useState(1);
  const [holeScores, setHoleScores] = useState<HoleData[]>([]);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchInProgressRound();
  }, [user]);

  const fetchInProgressRound = async () => {
    if (!user) return;

    try {
      const { data: rounds, error } = await supabase
        .from('rounds')
        .select(`
          id,
          course_id,
          golf_courses:course_id (
            id,
            name,
            city,
            state,
            course_tees (*)
          ),
          hole_scores (*)
        `)
        .eq('user_id', user.id)
        .eq('is_in_progress', true)
        .single();

      if (error) throw error;

      if (rounds) {
        setCurrentRoundId(rounds.id);
        setSelectedCourse(rounds.golf_courses);
        
        if (rounds.hole_scores && rounds.hole_scores.length > 0) {
          const restoredHoleScores = rounds.hole_scores.map((hole: any) => ({
            holeNumber: hole.hole_number,
            par: hole.par || 4,
            distance: hole.distance || 0,
            score: hole.score,
            putts: hole.putts,
            fairwayHit: hole.fairway_hit,
            greenInRegulation: hole.green_in_regulation
          }));
          
          setHoleScores(restoredHoleScores);
          setCurrentHole(restoredHoleScores.length);
        }
      }
    } catch (error) {
      console.error('Error fetching in-progress round:', error);
    }
  };

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    await fetchCourseHoles(course.id);
    
    if (!currentRoundId) {
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          course_id: course.id,
          user_id: user?.id,
          is_in_progress: true,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error starting round",
          description: "Could not start a new round. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setCurrentRoundId(data.id);
    }
  };

  const saveHoleScore = async (holeData: HoleData) => {
    if (!currentRoundId) return;

    try {
      const { error } = await supabase
        .from('hole_scores')
        .upsert({
          round_id: currentRoundId,
          hole_number: holeData.holeNumber,
          score: holeData.score,
          putts: holeData.putts,
          fairway_hit: holeData.fairwayHit,
          green_in_regulation: holeData.greenInRegulation
        }, {
          onConflict: 'round_id,hole_number'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving hole score:', error);
      toast({
        title: "Error saving hole score",
        description: "Could not save your progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchCourseHoles = async (courseId: string) => {
    try {
      const { data: holes, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');

      if (error) throw error;

      if (holes && holes.length > 0) {
        setHoleScores(holes.map((hole: any) => ({
          holeNumber: hole.hole_number,
          par: hole.par,
          distance: hole.distance_yards,
          score: 0,
          putts: 0
        })));
      } else {
        const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
          holeNumber: i + 1,
          par: 4,
          distance: 0,
          score: 0,
          putts: 0
        }));
        setHoleScores(defaultHoles);
      }
    } catch (error) {
      toast({
        title: "Error loading course data",
        description: "Please try again or enter the data manually",
        variant: "destructive"
      });
      
      const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        par: 4,
        distance: 0,
        score: 0,
        putts: 0
      }));
      setHoleScores(defaultHoles);
    }
  };

  const finishRound = async () => {
    if (!currentRoundId) return;

    try {
      await supabase
        .from('rounds')
        .update({ 
          is_in_progress: false,
          total_score: holeScores.reduce((sum, hole) => sum + hole.score, 0),
          total_putts: holeScores.reduce((sum, hole) => sum + hole.putts, 0),
          fairways_hit: holeScores.filter(hole => hole.fairwayHit).length,
          greens_in_regulation: holeScores.filter(hole => hole.greenInRegulation).length
        })
        .eq('id', currentRoundId);

      toast({
        title: "Round Completed",
        description: "Your round has been saved successfully!"
      });

      setCurrentRoundId(null);
      setCurrentHole(1);
      setHoleScores([]);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error finishing round:', error);
      toast({
        title: "Error finishing round",
        description: "Could not save round details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleHoleUpdate = (data: HoleData) => {
    setHoleScores(prev => 
      prev.map(hole => 
        hole.holeNumber === data.holeNumber ? data : hole
      )
    );
    saveHoleScore(data);
  };

  const handleNext = () => {
    if (currentHole < 18) {
      setCurrentHole(prev => prev + 1);
    } else {
      finishRound();
    }
  };

  const handlePrevious = () => {
    if (currentHole > 1) {
      setCurrentHole(prev => prev - 1);
    }
  };

  return {
    selectedCourse,
    selectedTee,
    currentHole,
    holeScores,
    handleCourseSelect,
    setSelectedTee,
    handleHoleUpdate,
    handleNext,
    handlePrevious,
    currentTeeColor: selectedTee && selectedCourse 
      ? selectedCourse.course_tees.find(tee => tee.id === selectedTee)?.color 
      : undefined,
    currentHoleData: holeScores.find(hole => hole.holeNumber === currentHole) || 
      (holeScores.length > 0 ? holeScores[0] : {
        holeNumber: currentHole,
        par: 4,
        distance: 0,
        score: 0,
        putts: 0,
        courseId: selectedCourse?.id
      })
  };
};
