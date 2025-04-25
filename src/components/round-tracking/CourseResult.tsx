
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Edit2 } from "lucide-react";

interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  total_par?: number;
  is_verified?: boolean;
  course_tees: {
    id: string;
    name: string;
    color: string;
    course_rating: number;
    slope_rating: number;
  }[];
}

interface CourseResultProps {
  course: Course;
  onSelect: (course: Course) => void;
  onEdit?: (course: Course) => void;
  showEditButton?: boolean;
}

export const CourseResult = ({ course, onSelect, onEdit, showEditButton }: CourseResultProps) => {
  return (
    <Button
      variant="outline"
      className="w-full justify-between min-h-[4rem] h-auto py-3 px-4"
      onClick={() => onSelect(course)}
    >
      <div className="text-left flex-1 flex flex-col gap-1">
        <div className="font-semibold flex items-center gap-2 flex-wrap">
          {course.name}
          {course.is_verified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {course.city}, {course.state}
        </div>
        {course.course_tees && course.course_tees.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Tees: {course.course_tees.map(tee => tee.color || tee.name).join(", ")}
          </div>
        )}
      </div>
      {showEditButton && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(course);
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </Button>
  );
};
