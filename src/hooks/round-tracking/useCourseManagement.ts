
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types/round-tracking";

export const useCourseManagement = (currentRoundId: string | null) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    await fetchCourseHoles(course.id);
    
    if (!currentRoundId) {
      // Get the current user before creating the round
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        toast({
          title: "Authentication error",
          description: "You need to be logged in to start a round.",
          variant: "destructive"
        });
        return null;
      }
      
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          course_id: course.id,
          user_id: user.id,
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
        return null;
      }

      return data.id;
    }
    return null;
  };

  const fetchCourseHoles = async (courseId: string) => {
    try {
      const { data: holes, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');

      if (error) throw error;

      return holes?.map((hole: any) => ({
        holeNumber: hole.hole_number,
        par: hole.par,
        distance: hole.distance_yards,
        score: 0,
        putts: 0
      })) || createDefaultHoles();
    } catch (error) {
      toast({
        title: "Error loading course data",
        description: "Please try again or enter the data manually",
        variant: "destructive"
      });
      return createDefaultHoles();
    }
  };

  const createDefaultHoles = () => 
    Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0
    }));

  return {
    selectedCourse,
    selectedTee,
    setSelectedTee,
    handleCourseSelect,
    currentTeeColor: selectedTee && selectedCourse 
      ? selectedCourse.course_tees.find(tee => tee.id === selectedTee)?.color 
      : undefined
  };
};
