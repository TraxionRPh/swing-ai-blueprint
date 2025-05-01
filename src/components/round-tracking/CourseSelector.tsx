
import { useState, useEffect } from "react";
import { CourseSelectionCard } from "./course-selection/CourseSelectionCard";
import { SelectedCourseCard } from "./course-selection/SelectedCourseCard";
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
      console.log("Course has par data:", selectedCourse.total_par);
      console.log("Course has tees:", selectedCourse.course_tees?.length);
      console.log("Course has holes data:", selectedCourse.course_holes?.length || 0);
    }
  }, [selectedCourse]);

  const handleCourseSelect = (course: Course) => {
    console.log("Selected course:", course);
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
