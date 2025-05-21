
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Course } from "@/types/round-tracking";

export function useCourseSelection() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCourses(courses);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = courses.filter(course => 
      course.name.toLowerCase().includes(query) || 
      course.city.toLowerCase().includes(query) || 
      course.state.toLowerCase().includes(query)
    );
    
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);
  
  // Fetch courses from Supabase
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Get all courses with their tees in a single query
      const { data: coursesData, error: coursesError } = await supabase
        .from("golf_courses")
        .select(`
          id, 
          name, 
          city, 
          state,
          total_par,
          is_verified,
          course_tees (*)
        `)
        .order("name");
      
      if (coursesError) throw coursesError;
      
      console.log(`Fetched ${coursesData.length} courses successfully`);
      setCourses(coursesData);
      setFilteredCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setHasError(true);
      toast({
        title: "Failed to load courses",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchCourses();
  }, []);
  
  return {
    courses,
    filteredCourses,
    searchQuery,
    setSearchQuery,
    isLoading,
    hasError,
    refreshCourses: fetchCourses
  };
}
