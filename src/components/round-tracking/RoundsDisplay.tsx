
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseResult } from "./CourseResult";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Course } from "@/types/round-tracking";

interface RoundsDisplayProps {
  onCourseSelect: (course: Course) => void;
}

interface RoundWithCourse {
  id: string;
  total_score: number | null;
  golf_courses: Course;
}

export const RoundsDisplay = ({ onCourseSelect }: RoundsDisplayProps) => {
  const [inProgressRounds, setInProgressRounds] = useState<RoundWithCourse[]>([]);
  const [completedRounds, setCompletedRounds] = useState<RoundWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const { data: rounds, error } = await supabase
          .from('rounds')
          .select(`
            id,
            total_score,
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
          .order('created_at', { ascending: false });

        if (error) throw error;

        const inProgress = rounds?.filter(round => !round.total_score) || [];
        const completed = rounds?.filter(round => round.total_score !== null) || [];

        setInProgressRounds(inProgress as RoundWithCourse[]);
        setCompletedRounds(completed as RoundWithCourse[]);
      } catch (error) {
        toast({
          title: "Error loading rounds",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
  }, [toast]);

  if (loading) return null;

  const renderRoundsList = (rounds: RoundWithCourse[], title: string) => {
    if (rounds.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rounds.map((round) => (
            <CourseResult
              key={round.id}
              course={round.golf_courses}
              onSelect={onCourseSelect}
            />
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {renderRoundsList(inProgressRounds, "In Progress Rounds")}
      {renderRoundsList(completedRounds, "Recently Completed Rounds")}
    </div>
  );
};
