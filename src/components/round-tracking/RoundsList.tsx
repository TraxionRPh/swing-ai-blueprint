
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-native";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";

interface Round {
  id: string;
  date: string;
  total_score: number | null;
  hole_count: number;
  course: {
    name: string;
    city: string;
    state: string;
  };
}

export const RoundsList = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRounds();
  }, [user]);

  const fetchRounds = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("rounds")
        .select(`
          id,
          date,
          total_score,
          hole_count,
          golf_courses:course_id (
            name,
            city,
            state
          )
        `)
        .eq("user_id", user.id)
        .not('total_score', 'is', null) // Only fetch rounds with a total_score (completed rounds)
        .order("date", { ascending: false });

      if (error) throw error;

      const formattedRounds = data.map((round: any) => ({
        id: round.id,
        date: round.date,
        total_score: round.total_score,
        hole_count: round.hole_count || 18,
        course: {
          name: round.golf_courses?.name || "Unknown Course",
          city: round.golf_courses?.city || "",
          state: round.golf_courses?.state || "",
        },
      }));

      setRounds(formattedRounds);
    } catch (error) {
      console.error("Error fetching rounds:", error);
      toast({
        title: "Error loading rounds",
        description: "Could not load your rounds. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRound = () => {
    console.log("Creating new round...");
    navigate("/rounds/new");
  };

  const handleSelectRound = (roundId: string) => {
    navigate(`/rounds/${roundId}`);
  };

  if (isLoading) {
    return <LoadingState onBack={onBack} />;
  }

  return (
    <div className="space-y-6">
      <RoundHeader
        title="Round History"
        subtitle="View your completed rounds"
        onBack={onBack}
      />

      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateRound}>
          <Plus className="h-4 w-4 mr-2" />
          New Round
        </Button>
      </div>

      {rounds.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't completed any rounds yet.
            </p>
            <Button onClick={handleCreateRound}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Round
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rounds.map((round) => (
            <Card
              key={round.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectRound(round.id)}
            >
              <CardContent className="py-4 px-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{round.course.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {round.course.city}, {round.course.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(round.date), "MMM d, yyyy")}
                    </div>
                    <div className="font-medium flex items-center">
                      <span>{round.total_score} ({round.hole_count} holes)</span>
                      <ChevronRight className="h-4 w-4 ml-1 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
