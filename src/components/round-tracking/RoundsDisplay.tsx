
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseResult } from "./CourseResult";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import type { Course } from "@/types/round-tracking";
import { InProgressRoundCard } from "./InProgressRoundCard";
import { Loading } from "@/components/ui/loading";

interface RoundsDisplayProps {
  onCourseSelect: (course: Course, holeCount?: number) => void;
}

interface RoundWithCourse {
  id: string;
  total_score: number | null;
  hole_count: number;
  hole_scores: {
    hole_number: number;
    score?: number;
  }[];
  golf_courses: Course;
}

export const RoundsDisplay = ({ onCourseSelect }: RoundsDisplayProps) => {
  const [inProgressRounds, setInProgressRounds] = useState<RoundWithCourse[]>([]);
  const [completedRounds, setCompletedRounds] = useState<RoundWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchRounds = async () => {
    setLoading(true);
    try {
      console.log("Fetching rounds data from supabase");
      const { data: rounds, error } = await supabase
        .from('rounds')
        .select(`
          id,
          total_score,
          hole_count,
          hole_scores (
            hole_number,
            score
          ),
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
      
      console.log("Rounds data fetched:", rounds?.length || 0, "rounds");

      // Filter in-progress rounds (no total_score)
      const inProgress = rounds?.filter(round => round.total_score === null) || [];
      // Filter completed rounds (have total_score)
      const completed = rounds?.filter(round => round.total_score !== null) || [];
      
      console.log("In-progress rounds:", inProgress.length);
      console.log("Completed rounds:", completed.length);

      setInProgressRounds(inProgress as RoundWithCourse[]);
      setCompletedRounds(completed as RoundWithCourse[]);
    } catch (error) {
      console.error("Error loading rounds:", error);
      toast({
        title: "Error loading rounds",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, [toast]);

  const handleDeleteRound = async (roundId: string) => {
    try {
      console.log("Deleting round:", roundId);
      
      // Delete hole scores first due to foreign key constraints
      const { error: holeScoresError } = await supabase
        .from('hole_scores')
        .delete()
        .eq('round_id', roundId);

      if (holeScoresError) throw holeScoresError;

      // Then delete the round
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);

      if (error) throw error;

      await fetchRounds();
      
      toast({
        title: "Round deleted",
        description: "The round has been successfully deleted"
      });
    } catch (error) {
      console.error("Error deleting round:", error);
      toast({
        title: "Error deleting round",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <Loading message="Loading rounds..." />;
  }

  const renderInProgressRounds = () => {
    if (inProgressRounds.length === 0) return null;
    
    return inProgressRounds.map((round) => {
      // Count holes with scores (score > 0)
      const holesCompleted = round.hole_scores?.filter(h => h.score && h.score > 0)?.length || 0;
      
      return (
        <InProgressRoundCard
          key={round.id}
          roundId={round.id}
          courseName={round.golf_courses.name}
          lastHole={holesCompleted}
          holeCount={round.hole_count || 18}
          onDelete={() => handleDeleteRound(round.id)}
        />
      );
    });
  };

  const renderRoundsList = (rounds: RoundWithCourse[], title: string, isInProgress: boolean) => {
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
              onSelect={isInProgress ? 
                () => navigate(`/rounds/${round.id}`) : 
                (course) => onCourseSelect(course, round.hole_count || 18)
              }
              isInProgress={isInProgress}
              roundId={isInProgress ? round.id : undefined}
              onDelete={isInProgress ? () => handleDeleteRound(round.id) : undefined}
            />
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {renderInProgressRounds()}
      {renderRoundsList(completedRounds, "Recently Completed Rounds", false)}
    </div>
  );
};
