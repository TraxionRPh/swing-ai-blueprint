
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/round-tracking";
import { useToast } from "@/hooks/use-toast";

const CACHE_KEY = "golf_courses_cache";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useCoursesFetcher() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter courses based on search query
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

  // Check if the cache is still valid
  const isCacheValid = () => {
    const cacheData = localStorage.getItem(CACHE_KEY);
    if (!cacheData) return false;
    
    try {
      const { timestamp } = JSON.parse(cacheData);
      return Date.now() - timestamp < CACHE_EXPIRY;
    } catch (e) {
      return false;
    }
  };

  // Get courses from cache
  const getCoursesFromCache = (): Course[] | null => {
    try {
      const cacheData = localStorage.getItem(CACHE_KEY);
      if (!cacheData) return null;
      
      const { data } = JSON.parse(cacheData);
      return data;
    } catch (e) {
      console.error("Error reading from cache:", e);
      return null;
    }
  };

  // Save courses to cache
  const saveCoursesToCache = (coursesData: Course[]) => {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data: coursesData
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.error("Error saving to cache:", e);
    }
  };

  // Fetch courses from Supabase with a single optimized query
  const fetchCoursesFromAPI = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      console.log("Fetching courses from API with optimized query");
      
      // Single query to get courses with their tees
      const { data, error } = await supabase
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

      if (error) throw error;

      const coursesWithTees = data.map(course => ({
        ...course,
        course_tees: course.course_tees || []
      }));

      console.log(`Fetched ${coursesWithTees.length} courses from API`);
      
      // Update state and cache the result
      setCourses(coursesWithTees);
      setFilteredCourses(coursesWithTees);
      saveCoursesToCache(coursesWithTees);
      
      return coursesWithTees;
    } catch (error) {
      console.error("Error fetching courses:", error);
      setHasError(true);
      toast({
        title: "Error loading courses",
        description: "Could not load the course list. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Main fetch function that tries cache first, then API
  const fetchCourses = async () => {
    if (isCacheValid()) {
      console.log("Using cached courses data");
      const cachedCourses = getCoursesFromCache();
      
      if (cachedCourses && cachedCourses.length > 0) {
        setCourses(cachedCourses);
        setFilteredCourses(cachedCourses);
        setIsLoading(false);
        
        // Refresh cache in background
        fetchCoursesFromAPI().catch(console.error);
        return;
      }
    }
    
    // Cache invalid or empty, fetch from API
    await fetchCoursesFromAPI();
  };

  // Retry fetching
  const refetchCourses = () => {
    fetchCoursesFromAPI();
  };

  return {
    courses,
    filteredCourses,
    isLoading,
    hasError,
    searchQuery,
    setSearchQuery,
    fetchCourses,
    refetchCourses
  };
}
