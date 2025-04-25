import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CourseSearch } from "./CourseSearch";
interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  course_tees: {
    id: string;
    name: string;
    color: string;
    course_rating: number;
    slope_rating: number;
  }[];
}
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
    return <Card>
        <CardHeader>
          <CardTitle>Select a Course</CardTitle>
          <CardDescription>
            Search for a course or enter course details manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseSearch onCourseSelect={handleCourseSelect} />
        </CardContent>
      </Card>;
  }
  const currentTee = selectedCourse.course_tees.find(tee => tee.id === selectedTee);
  return <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">{selectedCourse.name}</h2>
            {currentTee && <p className="text-sm text-muted-foreground">
                Tee: {currentTee.color || currentTee.name} • 
                Course Rating: {currentTee.course_rating} • 
                Slope: {currentTee.slope_rating}
              </p>}
          </div>
          <Button variant="outline" onClick={() => setShowCourseSearch(true)}>
            Change Course
          </Button>
        </div>
        
        {selectedCourse.course_tees && selectedCourse.course_tees.length > 0 && <div className="mt-4">
            <p className="text-sm mb-2">Select Tee:</p>
            <div className="flex gap-2 flex-wrap">
              {selectedCourse.course_tees.map(tee => <Button key={tee.id} size="sm" variant={selectedTee === tee.id ? "default" : "outline"} onClick={() => onTeeSelect(tee.id)} className="make the background the same color as the selected tee">
                  {tee.color || tee.name}
                </Button>)}
            </div>
          </div>}
      </CardContent>

      <Dialog open={showCourseSearch} onOpenChange={setShowCourseSearch}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogTitle>Select a Course</DialogTitle>
          <DialogDescription>
            Search for a course or enter course details manually
          </DialogDescription>
          <CourseSearch onCourseSelect={handleCourseSelect} />
        </DialogContent>
      </Dialog>
    </Card>;
};