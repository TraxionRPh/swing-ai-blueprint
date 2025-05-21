
import React from "react";

interface CourseSelectionHeaderProps {
  title?: string;
  subtitle?: string;
}

export const CourseSelectionHeader = ({
  title = "Course Selection",
  subtitle = "Select a course to track your round"
}: CourseSelectionHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};
