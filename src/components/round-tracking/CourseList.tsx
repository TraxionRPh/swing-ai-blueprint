
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Course } from "@/types/round-tracking";
import { CourseCard } from "./CourseCard";

interface CourseListProps {
  isLoading: boolean;
  hasError: boolean;
  filteredCourses: Course[];
  searchQuery: string;
  expandedCourseId: string | null;
  selectedTeeId: string | null;
  selectedHoleCount: number;
  isProcessing: boolean;
  processingError: string | null;
  onCourseClick: (courseId: string, course: Course) => void;
  onTeeSelect: (teeId: string) => void;
  onAddTee: (course: Course) => void;
  onHoleCountChange: (count: number) => void;
  onStartRound: () => void;
  onRefreshCourses: () => void;
  onClearSearch: () => void;
}

export const CourseList = ({
  isLoading,
  hasError,
  filteredCourses,
  searchQuery,
  expandedCourseId,
  selectedTeeId,
  selectedHoleCount,
  isProcessing,
  processingError,
  onCourseClick,
  onTeeSelect,
  onAddTee,
  onHoleCountChange,
  onStartRound,
  onRefreshCourses,
  onClearSearch
}: CourseListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (hasError) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground mb-4">
            Could not load courses. Please try again.
          </p>
          <Button variant="default" onClick={onRefreshCourses}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (filteredCourses.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "No courses match your search" : "No courses available"}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={onClearSearch}>
              Clear search
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCourses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          isExpanded={expandedCourseId === course.id}
          selectedTeeId={selectedTeeId}
          selectedHoleCount={selectedHoleCount}
          isProcessing={isProcessing}
          processingError={processingError}
          onCourseClick={onCourseClick}
          onTeeSelect={onTeeSelect}
          onAddTee={onAddTee}
          onHoleCountChange={onHoleCountChange}
          onStartRound={onStartRound}
        />
      ))}
    </div>
  );
};
