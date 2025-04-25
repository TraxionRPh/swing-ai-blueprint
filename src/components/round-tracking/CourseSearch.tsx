import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CourseForm } from "./course/CourseForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { SearchInput } from "./SearchInput";
import { CourseResult } from "./CourseResult";
import { RecentlyPlayed } from "./RecentlyPlayed";
import type { Course } from "@/types/round-tracking";

interface CourseSearchProps {
  onCourseSelect: (course: Course, holeCount?: number) => void;
}

export const CourseSearch = ({ onCourseSelect }: CourseSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();
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

  const handleEdit = async (course: Course) => {
    const previousState = {
      name: course.name,
      city: course.city,
      state: course.state
    };

    try {
      const { error } = await supabase
        .from('course_edit_history')
        .insert({
          course_id: course.id,
          edited_by: user?.id,
          previous_state: previousState,
          changes: {} // Will be updated when changes are saved
        });

      if (error) throw error;

      setShowAddForm(true);
      onCourseSelect(course);
    } catch (error) {
      toast({
        title: "Error starting edit",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
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
      <CourseForm 
        onCourseCreated={handleCourseCreated}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SearchInput
        searchQuery={searchQuery}
        onChange={handleSearchChange}
        onClear={clearSearch}
      />

      {courses.length > 0 ? (
        <div className="space-y-2">
          {courses.map((course) => (
            <CourseResult
              key={course.id}
              course={course}
              onSelect={onCourseSelect}
              onEdit={handleEdit}
              showEditButton={!!user}
            />
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

      {!searchQuery && (
        <>
          <RecentlyPlayed onCourseSelect={onCourseSelect} />
          <div className="text-center py-4 border-t border-gray-200 mt-4">
            <p className="text-muted-foreground mb-2">Can't find your course?</p>
            <Button onClick={() => setShowAddForm(true)}>
              Add New Course
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
