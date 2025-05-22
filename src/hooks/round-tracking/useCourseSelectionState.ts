
import { useState } from "react";
import { Course, CourseTee } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useCourseSelectionState() {
  const { toast } = useToast();
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string | null>(null);
  const [selectedHoleCount, setSelectedHoleCount] = useState<number>(18);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showTeeDialog, setShowTeeDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // Handle course card click
  const handleCourseClick = (courseId: string, course: Course) => {
    if (expandedCourseId === courseId) {
      // If already expanded, collapse it
      setExpandedCourseId(null);
      setSelectedCourse(null);
      setSelectedTeeId(null);
    } else {
      // Expand this course
      setExpandedCourseId(courseId);
      setSelectedCourse(course);
      
      // Auto-select first tee if available
      if (course.course_tees && course.course_tees.length > 0) {
        setSelectedTeeId(course.course_tees[0].id);
      } else {
        setSelectedTeeId(null);
      }
    }
  };
  
  // Handle adding a new tee
  const handleAddTee = (course: Course) => {
    setCurrentCourse(course);
    setShowTeeDialog(true);
  };

  // Fetch a course with its tees by ID
  const fetchCourseById = async (courseId: string): Promise<Course | null> => {
    try {
      const { data, error } = await supabase
        .from("golf_courses")
        .select(`
          id, 
          name, 
          city, 
          state, 
          total_par,
          is_verified,
          course_tees (*)
        `)
        .eq('id', courseId)
        .single();
      
      if (error) {
        console.error("Error fetching course:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Failed to fetch course:", error);
      return null;
    }
  };
  
  // Handle tee submission
  const handleTeeSubmit = async (teeData: any) => {
    if (!currentCourse) return false;
    
    try {
      // Add loading state or toast notification here if desired
      
      // Insert new tee into database
      const { data: newTee, error } = await supabase
        .from("course_tees")
        .insert({
          course_id: currentCourse.id,
          name: teeData[0].name,
          color: teeData[0].color,
          course_rating: teeData[0].courseRating || null,
          slope_rating: teeData[0].slopeRating || null,
          total_yards: teeData[0].totalYards || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // After successfully adding the tee, refresh the course data
      if (currentCourse.id) {
        const updatedCourse = await fetchCourseById(currentCourse.id);
        
        // If the course is currently selected, update the selected course
        if (selectedCourse && selectedCourse.id === currentCourse.id && updatedCourse) {
          setSelectedCourse(updatedCourse);
          // Auto-select the newly added tee
          if (newTee && newTee.id) {
            setSelectedTeeId(newTee.id);
          }
        }
        
        // Update current course reference too
        if (updatedCourse) {
          setCurrentCourse(updatedCourse);
        }
      }
      
      toast({
        title: "Tee added successfully",
        description: `${newTee.name} tee has been added to ${currentCourse.name}`,
      });
      
      // Close the dialog
      setShowTeeDialog(false);
      
      return newTee;
    } catch (error) {
      console.error("Error adding tee:", error);
      toast({
        title: "Failed to add tee",
        description: "Please try again",
        variant: "destructive"
      });
      
      return false;
    }
  };

  return {
    // State
    expandedCourseId,
    selectedTeeId,
    selectedHoleCount,
    selectedCourse,
    showTeeDialog,
    currentCourse,
    isProcessing,
    processingError,
    
    // Setters
    setExpandedCourseId,
    setSelectedTeeId,
    setSelectedHoleCount,
    setSelectedCourse,
    setShowTeeDialog,
    setCurrentCourse,
    setIsProcessing,
    setProcessingError,
    
    // Handlers
    handleCourseClick,
    handleAddTee,
    handleTeeSubmit,
    fetchCourseById
  };
}
