
import { useState } from "react";
import { CourseSelectionCard } from "./course-selection/CourseSelectionCard";
import { SelectedCourseCard } from "./course-selection/SelectedCourseCard";
import { HoleCountSelector } from "./hole-count/HoleCountSelector";
import { useParams } from "react-router-dom";
import type { Course } from "@/types/round-tracking";

interface CourseSelectorProps {
  selectedCourse: Course | null;
  selectedTee: string | null;
  onCourseSelect: (course: Course) => void;
  onTeeSelect: (teeId: string) => void;
  onHoleCountSelect?: (count: number) => void;
}

export const CourseSelector = ({
  selectedCourse,
  selectedTee,
  onCourseSelect,
  onTeeSelect,
  onHoleCountSelect
}: CourseSelectorProps) => {
  const [showCourseSearch, setShowCourseSearch] = useState(!selectedCourse);
  const [showHoleCountSelect, setShowHoleCountSelect] = useState(false);
  const { roundId } = useParams();
  
  // Check if we're creating a new round
  const isNewRound = roundId === "new";

  const handleCourseSelect = (course: Course) => {
    onCourseSelect(course);
    setShowCourseSearch(false);

    // Set first tee as default if available
    if (course.course_tees && course.course_tees.length > 0) {
      onTeeSelect(course.course_tees[0].id);
    }
    
    // Show hole count selector when creating a new round
    if (isNewRound && onHoleCountSelect) {
      setShowHoleCountSelect(true);
    }
  };
  
  const handleHoleCountSelect = (count: number) => {
    if (onHoleCountSelect) {
      onHoleCountSelect(count);
      setShowHoleCountSelect(false);
    }
  };

  if (!selectedCourse) {
    return <CourseSelectionCard onCourseSelect={handleCourseSelect} />;
  }
  
  if (showHoleCountSelect && selectedCourse) {
    return <HoleCountSelector 
      selectedCourse={selectedCourse} 
      onHoleCountSelect={handleHoleCountSelect} 
    />;
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
