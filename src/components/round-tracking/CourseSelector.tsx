
import { useState, useEffect } from "react";
import { CourseSelectionCard } from "./course-selection/CourseSelectionCard";
import { SelectedCourseCard } from "./course-selection/SelectedCourseCard";
import { supabase } from "@/integrations/supabase/client";
import type { Course } from "@/types/round-tracking";

interface CourseSelectorProps {
  selectedCourse: Course | null;
  selectedTee: string | null;
  onCourseSelect: (course: Course) => void;
  onTeeSelect: (teeId: string) => void;
}

export const CourseSelector = ({
  selectedCourse,
  selectedTee,
  onCourseSelect,
  onTeeSelect
}: CourseSelectorProps) => {
  const [showCourseSearch, setShowCourseSearch] = useState(!selectedCourse);
  
  // Log current course state for debugging
  useEffect(() => {
    if (selectedCourse) {
      console.log("Course selected:", selectedCourse.name);
      console.log("Course ID:", selectedCourse.id);
      console.log("Course has par data:", selectedCourse.total_par);
      console.log("Course has tees:", selectedCourse.course_tees?.length);
      console.log("Course has holes data:", selectedCourse.course_holes?.length || 0);
      
      if (selectedCourse.course_holes && selectedCourse.course_holes.length > 0) {
        console.log("Sample hole data:", selectedCourse.course_holes[0]);
      }
    }
  }, [selectedCourse]);

  const handleCourseSelect = async (course: Course) => {
    console.log("Selected course:", course.name, "with ID:", course.id);
    
    // Fetch course holes data before setting the selected course
    try {
      console.log(`Fetching holes data for course ID: ${course.id}`);
      const { data: holesData, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', course.id)
        .order('hole_number');
        
      if (error) {
        console.error("Error fetching course holes:", error);
      } else if (holesData && holesData.length > 0) {
        console.log(`Found ${holesData.length} holes for course ${course.id}`);
        console.log("First hole data:", holesData[0]);
        
        // Attach the holes data to the course object
        course.course_holes = holesData;
        
        // Log sample hole data to verify it's correctly formatted
        if (holesData.length > 0) {
          const firstHole = holesData[0];
          console.log(`Hole ${firstHole.hole_number}: par ${firstHole.par}, distance ${firstHole.distance_yards}yd`);
        }
      } else {
        console.log(`No hole data found for course ${course.id}`);
      }
    } catch (e) {
      console.error("Exception fetching course holes:", e);
    }
    
    onCourseSelect(course);
    setShowCourseSearch(false);

    // Set first tee as default if available
    if (course.course_tees && course.course_tees.length > 0) {
      console.log("Setting default tee:", course.course_tees[0].name);
      onTeeSelect(course.course_tees[0].id);
    }
  };

  if (!selectedCourse) {
    return <CourseSelectionCard onCourseSelect={handleCourseSelect} />;
  }

  return (
    <SelectedCourseCard
      course={selectedCourse}
      selectedTee={selectedTee}
      onTeeSelect={onTeeSelect}
      onChangeClick={() => setShowCourseSearch(true)}
      showCourseSearch={showCourseSearch}
      setShowCourseSearch={setShowCourseSearch}
      onCourseSelect={handleCourseSelect}
    />
  );
};
