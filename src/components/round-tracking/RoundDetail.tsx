
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRound } from "@/context/round";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";
import { useResumeSession } from "@/hooks/round-tracking/useResumeSession";

interface RoundDetailProps {
  onBack: () => void;
}

export const RoundDetail = ({ onBack }: RoundDetailProps) => {
  const navigate = useNavigate();
  const { roundId } = useParams();
  const { 
    currentRoundId,
    setCurrentRoundId,
    holeScores, 
    holeCount,
    selectedCourse,
    isLoading
  } = useRound();
  
  const { resumeHole, getSavedRoundId } = useResumeSession({
    currentHole: 1,
    holeCount,
    roundId: roundId || null
  });

  // Initialize with the round ID from the URL or from session storage
  useEffect(() => {
    if (roundId && roundId !== currentRoundId) {
      console.log(`Setting current round ID to: ${roundId}`);
      setCurrentRoundId(roundId);
    } else if (!roundId) {
      const savedRoundId = getSavedRoundId();
      if (savedRoundId) {
        console.log(`Restored round ID from storage: ${savedRoundId}`);
        setCurrentRoundId(savedRoundId);
      }
    }
  }, [roundId, currentRoundId, setCurrentRoundId, getSavedRoundId]);

  // Determine the next hole to play
  const getNextHoleToPlay = () => {
    if (resumeHole) return resumeHole;
    
    // Find the first hole that doesn't have a score
    const incompleteHole = holeScores.find(h => !h.score);
    if (incompleteHole) {
      return incompleteHole.holeNumber;
    }
    
    return 1; // Default to the first hole if all are completed
  };

  const handleStartRound = () => {
    const nextHole = getNextHoleToPlay();
    console.log(`Starting/continuing round at hole ${nextHole}`);
    navigate(`/rounds/${roundId}/${nextHole}`);
  };
  
  const handleReview = () => {
    console.log(`Navigating to review for round ${roundId}`);
    navigate(`/rounds/${roundId}/review`);
  };
  
  if (isLoading) {
    return <LoadingState onBack={onBack} message="Loading round details..." />;
  }
  
  // Calculate round statistics
  const completedHoles = holeScores.filter(h => h.score).length;
  const totalScore = holeScores.reduce((sum, h) => sum + (h.score || 0), 0);
  
  return (
    <div className="space-y-6">
      <RoundHeader
        title={selectedCourse?.name || "Round Details"}
        subtitle={selectedCourse ? `${selectedCourse.city}, ${selectedCourse.state}` : ""}
        onBack={onBack}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Round Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Holes Completed</span>
              <span className="font-semibold">{completedHoles} of {holeCount}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Score</span>
              <span className="font-semibold">{totalScore > 0 ? totalScore : "-"}</span>
            </div>
            
            {completedHoles > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="font-semibold">In Progress</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleStartRound} 
              className="w-full"
            >
              {completedHoles > 0 ? "Continue Round" : "Start Round"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReview} 
              className="w-full" 
              disabled={completedHoles === 0}
            >
              Review Round
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
