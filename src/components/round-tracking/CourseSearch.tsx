
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CourseForm } from "./CourseForm";
import { Card } from "@/components/ui/card";

interface Course {
  id: string;
  name: string;
  address: string | null;
  course_tees: {
    id: string;
    name: string;
    color: string;
    course_rating: number;
    slope_rating: number;
  }[];
}

interface CourseSearchProps {
  onCourseSelect: (course: Course) => void;
}

export const CourseSearch = ({ onCourseSelect }: CourseSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const searchCourses = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select(`
          *,
          course_tees (
            id,
            name,
            color,
            course_rating,
            slope_rating
          )
        `)
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      if (error) throw error;

      setCourses(data || []);
    } catch (error) {
      toast({
        title: "Error searching courses",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseCreated = (course: Course) => {
    setShowAddForm(false);
    onCourseSelect(course);
  };

  if (showAddForm) {
    return (
      <Card className="p-4">
        <CourseForm 
          onCourseCreated={handleCourseCreated}
          onCancel={() => setShowAddForm(false)}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for a golf course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={searchCourses}
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-2">
          {courses.map((course) => (
            <Button
              key={course.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => onCourseSelect(course)}
            >
              <div className="text-left">
                <div>{course.name}</div>
                <div className="text-sm text-muted-foreground">{course.address}</div>
                {course.course_tees && course.course_tees.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Tees: {course.course_tees.map(tee => tee.color || tee.name).join(", ")}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground mb-2">No courses found</p>
          <Button onClick={() => setShowAddForm(true)}>
            Add New Course
          </Button>
        </div>
      )}
    </div>
  );
};
