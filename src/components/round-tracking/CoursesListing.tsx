
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, AlertTriangle } from "lucide-react";
import { RoundHeader } from "./RoundHeader";
import { Course } from "@/types/round-tracking";
import { useRound } from "@/context/round";

interface CoursesListingProps {
  onBack: () => void;
}

export const CoursesListing = ({ onBack }: CoursesListingProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setSelectedCourse, setSelectedTeeId } = useRound();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCourses(
        courses.filter(
          (course) =>
            course.name.toLowerCase().includes(query) ||
            course.city.toLowerCase().includes(query) ||
            course.state.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, courses]);

  const fetchAllCourses = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const { data, error } = await supabase
        .from("golf_courses")
        .select("id, name, city, state")
        .order("name");

      if (error) throw error;

      // Now get tees for each course
      const coursesWithTees = await Promise.all(
        (data || []).map(async (course) => {
          const { data: tees } = await supabase
            .from("course_tees")
            .select("*")
            .eq("course_id", course.id);
            
          return {
            ...course,
            course_tees: tees || []
          };
        })
      );

      setCourses(coursesWithTees);
      setFilteredCourses(coursesWithTees);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setHasError(true);
      toast({
        title: "Error loading courses",
        description: "Could not load the course list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    
    // Set the first tee as default if available
    if (course.course_tees?.length > 0) {
      setSelectedTeeId(course.course_tees[0].id);
    }
    
    navigate(`/rounds/new`);
  };

  const handleAddCourse = () => {
    // For now just show a toast - later this could navigate to a course creation form
    toast({
      title: "Add Course",
      description: "Course creation feature coming soon!",
    });
  };

  const handleViewRounds = () => {
    navigate("/rounds/list");
  };

  return (
    <div className="space-y-6">
      <RoundHeader
        title="Course Selection"
        subtitle="Select a course to start a new round"
        onBack={onBack}
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses by name, city or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={handleAddCourse} variant="outline" className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
          <Button onClick={handleViewRounds} variant="secondary" className="whitespace-nowrap">
            View My Rounds
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading courses...</p>
        </div>
      )}

      {hasError && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load courses</h3>
            <p className="text-muted-foreground mb-4">There was a problem loading the course list.</p>
            <Button onClick={fetchAllCourses}>Try Again</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !hasError && filteredCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery.trim() ? "No courses match your search." : "No courses available."}
            </p>
            {searchQuery.trim() && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && !hasError && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectCourse(course)}
            >
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-1">{course.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {course.city}, {course.state}
                </p>
                <p className="text-sm">
                  {course.course_tees && course.course_tees.length > 0
                    ? `${course.course_tees.length} tee${course.course_tees.length > 1 ? "s" : ""} available`
                    : "No tee information"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
