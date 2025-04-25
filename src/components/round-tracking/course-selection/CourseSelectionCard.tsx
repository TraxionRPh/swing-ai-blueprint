
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { CourseSearch } from "../CourseSearch";
import { RoundsDisplay } from "../RoundsDisplay";
import type { Course } from "@/types/round-tracking";

interface CourseSelectionCardProps {
  onCourseSelect: (course: Course) => void;
}

export const CourseSelectionCard = ({ onCourseSelect }: CourseSelectionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Course</CardTitle>
        <CardDescription>
          Search for a course or select from your recent rounds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CourseSearch onCourseSelect={onCourseSelect} />
        <RoundsDisplay onCourseSelect={onCourseSelect} />
      </CardContent>
    </Card>
  );
};
