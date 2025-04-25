
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseResult } from "./CourseResult";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types/round-tracking";

interface RecentlyPlayedProps {
  onCourseSelect: (course: Course, holeCount?: number) => void;
}

interface RecentCourse extends Course {
  hole_count?: number;
}

export const RecentlyPlayed = ({ onCourseSelect }: RecentlyPlayedProps) => {
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        const { data: rounds, error } = await supabase
          .from('rounds')
          .select(`
            course_id,
            hole_count,
            golf_courses (
              id,
              name,
              city,
              state,
              is_verified,
              course_tees (
                id,
                name,
                color,
                course_rating,
                slope_rating
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        // Filter out duplicates and null values
        const uniqueCourses = rounds
          ?.map(round => ({
            ...round.golf_courses,
            hole_count: round.hole_count || 18
          }))
          .filter((course, index, self) => 
            course && self.findIndex(c => c?.id === course.id) === index
          ) as RecentCourse[];

        setRecentCourses(uniqueCourses || []);
      } catch (error) {
        toast({
          title: "Error loading recent courses",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCourses();
  }, [toast]);

  if (loading || recentCourses.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Recently Played</h3>
      <div className="space-y-2">
        {recentCourses.map((course) => (
          <CourseResult
            key={course.id}
            course={course}
            onSelect={(selectedCourse) => {
              onCourseSelect(selectedCourse, course.hole_count);
              sessionStorage.setItem('current-hole-count', course.hole_count?.toString() || '18');
            }}
          />
        ))}
      </div>
    </div>
  );
};
