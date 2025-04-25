
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CourseSearch } from "../CourseSearch";
import type { Course } from "@/types/round-tracking";

interface CourseSelectionCardProps {
  onCourseSelect: (course: Course, holeCount?: number) => void;
}

export const CourseSelectionCard = ({ onCourseSelect }: CourseSelectionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Course</CardTitle>
      </CardHeader>
      <CardContent>
        <CourseSearch onCourseSelect={onCourseSelect} />
      </CardContent>
    </Card>
  );
};
