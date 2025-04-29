
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseResult } from "./CourseResult";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import type { Course } from "@/types/round-tracking";
import { InProgressRoundCard } from "./InProgressRoundCard";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchRounds = useCallback(async () => {
    setLoading(true);
    setError(null);
    
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

      const inProgress = rounds?.filter(round => round.total_score === null) || [];
      const completed = rounds?.filter(round => round.total_score !== null) || [];
      
      console.log("In-progress rounds:", inProgress.length);
      console.log("Completed rounds:", completed.length);

      setInProgressRounds(inProgress as RoundWithCourse[]);
      setCompletedRounds(completed as RoundWithCourse[]);
    } catch (error) {
      console.error("Error loading rounds:", error);
      setError("Failed to load rounds data");
      toast({
        title: "Error loading rounds",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        console.log("Forced exit from loading state in RoundsDisplay after timeout");
      }
    }, 8000);
    
    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  useEffect(() => {
    const controller = new AbortController();
    
    fetchRounds().catch(err => {
      if (controller.signal.aborted) return;
      console.error("Failed to fetch rounds:", err);
    });
    
    return () => {
      controller.abort();
    };
  }, [fetchRounds]);

  const handleDeleteRound = async (roundId: string) => {
    try {
      console.log("Deleting round:", roundId);
      
      const { error: holeScoresError } = await supabase
        .from('hole_scores')
        .delete()
        .eq('round_id', roundId);

      if (holeScoresError) throw holeScoresError;

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
    return (
      <Card className="mb-6 min-h-[200px]">
        <CardContent className="pt-6 flex justify-center items-center">
          <Loading message="Loading rounds..." className="min-h-[150px]" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-center text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchRounds} className="mt-4 mx-auto block">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getLastCompletedHole = (holeScores) => {
    if (!holeScores || holeScores.length === 0) return 0;
    
    // Find all holes that have scores
    const scoredHoles = holeScores
      .filter(hole => hole.score && hole.score > 0)
      .sort((a, b) => a.hole_number - b.hole_number); // Sort by hole number ascending
    
    console.log("Scored holes:", scoredHoles.map(h => h.hole_number).join(', '));
    
    if (scoredHoles.length > 0) {
      // Get the last hole with a score
      const lastScoredHole = scoredHoles[scoredHoles.length - 1].hole_number;
      console.log("Last completed hole:", lastScoredHole);
      return lastScoredHole;
    }
    
    console.log("No holes with scores found");
    return 0;
  };

  const renderInProgressRounds = () => {
    if (inProgressRounds.length === 0) return null;
    
    return inProgressRounds.map((round) => {
      const lastCompletedHole = getLastCompletedHole(round.hole_scores);
      console.log(`Round ${round.id} - Last completed hole:`, lastCompletedHole);
      
      return (
        <InProgressRoundCard
          key={round.id}
          roundId={round.id}
          courseName={round.golf_courses.name}
          lastHole={lastCompletedHole}
          holeCount={round.hole_count || 18}
          onDelete={() => handleDeleteRound(round.id)}
        />
      );
    });
  };

  if (inProgressRounds.length === 0 && completedRounds.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No rounds found. Start a new round by selecting a course below.</p>
        </CardContent>
      </Card>
    );
  }

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
                () => navigate(`/rounds/${round.id}`, { replace: true }) : 
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
