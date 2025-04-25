
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CourseSearch } from "../CourseSearch";
import type { Course } from "@/types/round-tracking";

interface SelectedCourseCardProps {
  course: Course;
  selectedTee: string | null;
  onTeeSelect: (teeId: string) => void;
  onChangeClick: () => void;
  showCourseSearch: boolean;
  setShowCourseSearch: (show: boolean) => void;
  onCourseSelect: (course: Course) => void;
}

export const SelectedCourseCard = ({
  course,
  selectedTee,
  onTeeSelect,
  onChangeClick,
  showCourseSearch,
  setShowCourseSearch,
  onCourseSelect
}: SelectedCourseCardProps) => {
  const currentTee = course.course_tees.find(tee => tee.id === selectedTee);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{course.name}</h2>
            {currentTee && <p className="text-sm text-muted-foreground">
              Tee: {currentTee.color || currentTee.name} • 
              Course Rating: {currentTee.course_rating} • 
              Slope: {currentTee.slope_rating}
            </p>}
          </div>
          <Button variant="outline" onClick={onChangeClick}>
            Change Course
          </Button>
        </div>
        
        {course.course_tees && course.course_tees.length > 0 && (
          <div className="mt-4">
            <p className="text-sm mb-2">Select Tee:</p>
            <div className="flex gap-2 flex-wrap">
              {course.course_tees.map(tee => {
                const isLightColor = ['white', 'yellow', 'beige', 'gold', 'lightgray'].includes(tee.color?.toLowerCase() || '');
                const textColor = isLightColor ? 'text-black' : 'text-white';
                
                return (
                  <Button 
                    key={tee.id} 
                    size="sm" 
                    variant={selectedTee === tee.id ? "default" : "outline"} 
                    onClick={() => onTeeSelect(tee.id)} 
                    style={{ 
                      backgroundColor: tee.color || undefined, 
                      color: selectedTee === tee.id ? undefined : (tee.color ? textColor : undefined)
                    }}
                    className={`${selectedTee === tee.id ? '' : 'border'}`}
                  >
                    {tee.color || tee.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={showCourseSearch} onOpenChange={setShowCourseSearch}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogTitle>Select a Course</DialogTitle>
          <DialogDescription>
            Search for a course or enter course details manually
          </DialogDescription>
          <CourseSearch onCourseSelect={onCourseSelect} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
