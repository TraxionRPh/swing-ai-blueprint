
import { useState } from "react";
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

  const handleCourseSelect = (course: Course) => {
    onCourseSelect(course);
    setShowCourseSearch(false);

    // Set first tee as default if available
    if (course.course_tees && course.course_tees.length > 0) {
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
