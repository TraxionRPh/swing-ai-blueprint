
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRound } from "@/context/RoundContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GolfClub, Circle, Clock, Play, Edit } from "lucide-react";
import { format } from "date-fns";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";

interface RoundDetailProps {
  onBack: () => void;
}

export const RoundDetail = ({ onBack }: RoundDetailProps) => {
  const { roundId } = useParams<{ roundId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    setCurrentRoundId,
    selectedCourse,
    holeScores,
    holeCount,
    isLoading
  } = useRound();
  const [roundData, setRoundData] = useState<any>(null);
  
  useEffect(() => {
    if (roundId) {
      setCurrentRoundId(roundId);
      fetchRoundDetails();
    }
  }, [roundId]);
  
  const fetchRoundDetails = async () => {
    if (!roundId) return;
    
    try {
      const { data, error } = await supabase
        .from('rounds')
        .select(`
          *,
          golf_courses:course_id (
            id,
            name,
            city,
            state,
            total_par
          )
        `)
        .eq('id', roundId)
        .single();
        
      if (error) throw error;
      
      setRoundData(data);
    } catch (error) {
      console.error("Error fetching round details:", error);
      toast({
        title: "Error loading round",
        description: "Could not load round details. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleContinueRound = () => {
    // Find the first uncompleted hole or the last hole
    const lastCompletedHoleIndex = holeScores.findIndex(hole => 
      hole.score === 0 || hole.score === undefined
    );
    
    // If all holes have scores, go to the last hole
    const nextHoleNumber = lastCompletedHoleIndex >= 0 
      ? lastCompletedHoleIndex + 1 
      : holeCount;
      
    navigate(`/rounds/${roundId}/${nextHoleNumber}`);
  };
  
  const handleStartReview = () => {
    navigate(`/rounds/${roundId}/review`);
  };
  
  const handleEditHole = (holeNumber: number) => {
    navigate(`/rounds/${roundId}/${holeNumber}`);
  };
  
  if (isLoading || !roundData) {
    return <LoadingState onBack={onBack} message="Loading round details..." />;
  }
  
  // Check if the round is completed (has a total score)
  const isCompleted = roundData.total_score !== null;
  
  // Calculate round stats
  const totalPar = roundData.golf_courses?.total_par || 72;
  const scoreToPar = roundData.total_score !== null 
    ? roundData.total_score - totalPar 
    : null;
    
  const scoreRelationText = scoreToPar === 0 
    ? "Even par" 
    : scoreToPar > 0 
      ? `+${scoreToPar}` 
      : scoreToPar;
      
  return (
    <div className="space-y-6">
      <RoundHeader
        title={roundData.golf_courses?.name || "Round Detail"}
        subtitle={`${roundData.golf_courses?.city || ""}, ${roundData.golf_courses?.state || ""}`}
        onBack={onBack}
      />
      
      {/* Round Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Round Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{format(new Date(roundData.date), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center">
              <GolfClub className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{roundData.hole_count} holes</span>
            </div>
          </div>
          
          {isCompleted ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
                <div className="text-xl font-bold">{roundData.total_score}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
                <div className="text-xl font-bold">{scoreRelationText}</div>
                <div className="text-xs text-muted-foreground">vs. Par</div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
                <div className="text-xl font-bold">{roundData.total_putts || "N/A"}</div>
                <div className="text-xs text-muted-foreground">Total Putts</div>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border shadow-sm">
                <div className="text-xl font-bold">
                  {roundData.fairways_hit !== null 
                    ? `${roundData.fairways_hit}/${Math.floor(roundData.hole_count * 0.7)}` 
                    : "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">Fairways Hit</div>
              </div>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md mt-2">
              <h3 className="font-medium mb-2">Round in Progress</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This round is not yet completed. Continue playing or review and submit your scores.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleContinueRound}>
                  <Play className="h-4 w-4 mr-2" />
                  Continue Round
                </Button>
                <Button variant="outline" onClick={handleStartReview}>
                  Review Scores
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Hole Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Hole Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {Array.from({ length: roundData.hole_count }).map((_, i) => {
              const holeNumber = i + 1;
              const holeData = holeScores.find(h => h.holeNumber === holeNumber);
              const score = holeData?.score || 0;
              const par = holeData?.par || 4;
              
              // Determine score class
              let scoreClass = "bg-gray-100 text-gray-700";
              if (score > 0) {
                if (score < par) scoreClass = "bg-green-100 text-green-800";
                else if (score === par) scoreClass = "bg-gray-100 text-gray-700";
                else if (score === par + 1) scoreClass = "bg-yellow-100 text-yellow-800";
                else scoreClass = "bg-red-100 text-red-800";
              }
              
              return (
                <div key={holeNumber} 
                  className="relative cursor-pointer group" 
                  onClick={() => handleEditHole(holeNumber)}
                >
                  <div className="text-center p-2 border rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Hole {holeNumber}</div>
                    <div className={`text-center p-1 rounded-full w-8 h-8 mx-auto flex items-center justify-center ${scoreClass}`}>
                      {score > 0 ? score : "-"}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-md transition-all flex items-center justify-center">
                    <Edit className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
