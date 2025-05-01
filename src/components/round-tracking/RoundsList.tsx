
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseResult } from "./CourseResult";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import type { Course, Round } from "@/types/round-tracking";
import { InProgressRoundCard } from "./InProgressRoundCard";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface RoundsDisplayProps {
  onCourseSelect: (course: Course, holeCount?: number) => void;
  onError?: (error: string) => void;
}

interface RoundWithCourse {
  id: string;
  total_score: number | null;
  hole_count: number;
  hole_scores?: {
    hole_number: number;
    score?: number;
  }[];
  golf_courses?: Course;
}

export const RoundsDisplay = ({ onCourseSelect, onError }: RoundsDisplayProps) => {
  const [inProgressRounds, setInProgressRounds] = useState<Round[]>([]);
  const [completedRounds, setCompletedRounds] = useState<Round[]>([]);
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
          course_id,
          date,
          created_at,
          updated_at,
          fairways_hit,
          greens_in_regulation,
          total_putts,
          notes,
          user_id,
          tee_id,
          hole_scores (
            hole_number,
            score
          ),
          golf_courses:course_id (
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

      // Process data to ensure it matches the Round type interface
      if (rounds && rounds.length > 0) {
        const processedRounds: Round[] = rounds.map(round => {
          return {
            id: round.id,
            user_id: round.user_id,
            course_id: round.course_id || '',
            tee_id: round.tee_id || undefined,
            date: round.date,
            hole_count: round.hole_count || 18,
            total_score: round.total_score || undefined,
            total_putts: round.total_putts || undefined,
            fairways_hit: round.fairways_hit || undefined,
            greens_in_regulation: round.greens_in_regulation || undefined,
            created_at: round.created_at || undefined,
            updated_at: round.updated_at || undefined,
            // Make sure course has the expected shape with course_tees
            course: round.golf_courses ? {
              id: round.golf_courses.id,
              name: round.golf_courses.name,
              city: round.golf_courses.city,
              state: round.golf_courses.state,
              is_verified: round.golf_courses.is_verified,
              course_tees: round.golf_courses.course_tees || []
            } : undefined
          };
        });
        
        const inProgress = processedRounds.filter(round => round.total_score === null || round.total_score === undefined);
        const completed = processedRounds.filter(round => round.total_score !== null && round.total_score !== undefined);
        
        console.log("In-progress rounds:", inProgress.length);
        console.log("Completed rounds:", completed.length);

        setInProgressRounds(inProgress);
        setCompletedRounds(completed);
      } else {
        setInProgressRounds([]);
        setCompletedRounds([]);
      }
    } catch (error) {
      console.error("Error loading rounds:", error);
      const errorMessage = "Failed to load rounds data";
      setError(errorMessage);
      
      // Pass the error to the parent component if callback exists
      if (onError) {
        onError(errorMessage);
      }
      
      toast({
        title: "Error loading rounds",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, onError]);

  // Use a shorter timeout for exiting loading state to improve UI responsiveness
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        console.log("Forced exit from loading state in RoundsDisplay after timeout");
      }
    }, 3000); // reduced from 8s to 3s for faster response
    
    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  useEffect(() => {
    console.log("RoundsDisplay mounted, fetching rounds");
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

  const getLastCompletedHole = (holeScores: any[] | undefined) => {
    if (!holeScores || holeScores.length === 0) {
      return 0;
    }
    
    // Find all holes that have scores
    const scoredHoles = holeScores
      .filter(hole => hole.score && hole.score > 0)
      .sort((a, b) => a.hole_number - b.hole_number);
    
    if (scoredHoles.length > 0) {
      // Get the last hole with a score
      return scoredHoles[scoredHoles.length - 1].hole_number;
    }
    
    return 0;
  };

  const renderInProgressRounds = () => {
    if (inProgressRounds.length === 0) return null;
    
    return inProgressRounds.map((round) => {
      const lastCompletedHole = getLastCompletedHole(round.hole_scores);
      
      return (
        <InProgressRoundCard
          key={round.id}
          roundId={round.id}
          courseName={round.course?.name || 'Unknown Course'}
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

  const renderRoundsList = (rounds: Round[], title: string, isInProgress: boolean) => {
    if (rounds.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rounds.map((round) => {
            if (!round.course) return null;
            
            return (
              <CourseResult
                key={round.id}
                course={round.course}
                onSelect={isInProgress ? 
                  () => navigate(`/rounds/${round.id}`, { replace: true }) : 
                  (course) => onCourseSelect(course, round.hole_count || 18)
                }
                isInProgress={isInProgress}
                roundId={isInProgress ? round.id : undefined}
                onDelete={isInProgress ? () => handleDeleteRound(round.id) : undefined}
              />
            );
          })}
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
