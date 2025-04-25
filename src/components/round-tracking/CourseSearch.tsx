
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CourseForm } from "./CourseForm";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

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

interface CourseSearchProps {
  onCourseSelect: (course: Course) => void;
}

export const CourseSearch = ({ onCourseSelect }: CourseSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const searchCourses = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCourses([]);
      return;
    }

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
        .or(
          `name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`
        )
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
  }, [toast]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search - only search after 2 characters
    if (query.length >= 2) {
      searchCourses(query);
    } else {
      setCourses([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCourses([]);
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
      <div className="relative flex items-center">
        <Input
          placeholder="Search for a golf course (name, city, or state)..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 pr-10"
        />
        {searchQuery && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={clearSearch}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
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
                <div className="font-semibold">{course.name}</div>
                <div className="text-sm text-muted-foreground">
                  ({course.city}, {course.state})
                </div>
                {course.course_tees && course.course_tees.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Tees: {course.course_tees.map(tee => tee.color || tee.name).join(", ")}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      ) : (
        searchQuery.length >= 2 && !isLoading && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">No courses found</p>
            <Button onClick={() => setShowAddForm(true)}>
              Add New Course
            </Button>
          </div>
        )
      )}
    </div>
  );
};
