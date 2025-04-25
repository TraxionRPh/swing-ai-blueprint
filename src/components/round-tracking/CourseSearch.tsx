
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  name: string;
  address: string | null;
  courseRating: number | null;
  slopeRating: number | null;
  total_par: number | null;
}

interface CourseSearchProps {
  onCourseSelect: (course: Course) => void;
}

export const CourseSearch = ({ onCourseSelect }: CourseSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchCourses = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      if (error) throw error;

      // Transform the data to match our Course interface with camelCase properties
      const transformedData = (data || []).map(course => ({
        id: course.id,
        name: course.name,
        address: course.address,
        courseRating: course.course_rating,
        slopeRating: course.slope_rating,
        total_par: course.total_par
      }));

      setCourses(transformedData);
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

      {courses.length > 0 && (
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
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
