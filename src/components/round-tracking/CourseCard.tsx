
import { Card } from '@/components/ui/card';
import type { Course } from '@/types/round-tracking';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

export const CourseCard = ({ course, onSelect }: CourseCardProps) => {
  return (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => onSelect(course)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{course.name}</h3>
          <p className="text-sm text-muted-foreground">
            {course.city}, {course.state}
          </p>
        </div>
        {course.is_verified && (
          <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
            Verified
          </div>
        )}
      </div>
    </Card>
  );
};
