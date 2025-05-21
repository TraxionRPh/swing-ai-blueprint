
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Course } from "@/types/round-tracking";

export function useCourseSearch() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [showRecentCourses, setShowRecentCourses] = useState(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Live search effect
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setShowRecentCourses(true);
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Set timeout for debounce
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch();
    }, 300); // 300ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchRecentCourses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          course_id,
          golf_courses:course_id (
            id,
            name,
            city,
            state
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      // Filter out duplicates and nulls
      const uniqueCourses = data
        ?.filter(item => item.golf_courses) // Filter out null golf_courses
        ?.map(item => item.golf_courses)
        .filter((course, index, self) => 
          course && self.findIndex(c => c?.id === course?.id) === index
        );
      
      // Fix for TypeScript error - ensure course_tees is an array
      const coursesWithTees = await Promise.all(
        (uniqueCourses || []).map(async (course) => {
          if (!course) return null;
          
          // Fetch tees separately
          const { data: tees } = await supabase
            .from('course_tees')
            .select('*')
            .eq('course_id', course.id);
            
          return {
            ...course,
            course_tees: tees || []
          };
        })
      );
      
      // Filter out nulls from the async map
      const validCourses = coursesWithTees.filter(course => course !== null) as Course[];
      setRecentCourses(validCourses);
    } catch (error) {
      console.error("Error fetching recent courses:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    try {
      console.log("Searching for courses with query:", searchQuery);
      
      // First search by name
      const { data: nameResults, error: nameError } = await supabase
        .from('golf_courses')
        .select('id, name, city, state')
        .ilike('name', `%${searchQuery}%`)
        .order('name')
        .limit(10);
        
      if (nameError) throw nameError;
      
      // If no name results, search by location
      let searchData = nameResults;
      if (!nameResults || nameResults.length === 0) {
        const { data: locationData, error: locationError } = await supabase
          .from('golf_courses')
          .select('id, name, city, state')
          .or(`city.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%`)
          .order('name')
          .limit(10);
          
        if (locationError) throw locationError;
        searchData = locationData || [];
      }
      
      if (searchData.length === 0) {
        setSearchResults([]);
        setIsSearching(false);
        setShowRecentCourses(false);
        return;
      }
      
      console.log("Found courses:", searchData);
      
      // Now get tees for each course
      const coursesWithTees = await Promise.all(
        searchData.map(async (course) => {
          const { data: tees } = await supabase
            .from('course_tees')
            .select('*')
            .eq('course_id', course.id);
            
          return {
            ...course,
            course_tees: tees || []
          };
        })
      );
      
      setSearchResults(coursesWithTees);
      setShowRecentCourses(false);
    } catch (error) {
      console.error("Error searching courses:", error);
      toast({
        title: "Error searching courses",
        description: "Could not complete the search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    recentCourses,
    showRecentCourses,
    fetchRecentCourses,
  };
}
