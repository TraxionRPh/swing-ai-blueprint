
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRound } from "@/context/round";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";
import { useResumeSession } from "@/hooks/round-tracking/useResumeSession";
import { useToast } from "@/hooks/use-toast";

interface RoundDetailProps {
  onBack: () => void;
}

export const RoundDetail = ({ onBack }: RoundDetailProps) => {
  const navigate = useNavigate();
  const { roundId } = useParams();
  const { toast } = useToast();
  
  const { 
    currentRoundId,
    setCurrentRoundId,
    holeScores, 
    holeCount,
    selectedCourse,
    isLoading,
    setIsLoading
  } = useRound();
  
  const { resumeHole, getSavedRoundId } = useResumeSession({
    currentHole: 1,
    holeCount,
    roundId: roundId || null
  });

  // Initialize with the round ID from the URL
  useEffect(() => {
    if (roundId && roundId !== currentRoundId) {
      console.log(`RoundDetail: Setting current round ID to: ${roundId}`);
      setCurrentRoundId(roundId);
      
      // Also ensure it's saved to storage for persistence
      try {
        sessionStorage.setItem('current-round-id', roundId);
        localStorage.setItem('current-round-id', roundId);
      } catch (error) {
        console.error('Error saving round ID to storage:', error);
      }
    }
  }, [roundId, currentRoundId, setCurrentRoundId]);

  // Determine the next hole to play
  const getNextHoleToPlay = () => {
    if (resumeHole) {
      console.log(`Resuming at hole ${resumeHole} based on saved state`);
      return resumeHole;
    }
    
    // Check storage for last played hole
    try {
      const sessionHole = sessionStorage.getItem('current-hole-number');
      const localHole = localStorage.getItem('current-hole-number');
      
      if (sessionHole && !isNaN(Number(sessionHole))) {
        const parsed = Number(sessionHole);
        if (parsed >= 1 && parsed <= holeCount) {
          console.log(`Found saved hole number in session: ${parsed}`);
          return parsed;
        }
      }
      
      if (localHole && !isNaN(Number(localHole))) {
        const parsed = Number(localHole);
        if (parsed >= 1 && parsed <= holeCount) {
          console.log(`Found saved hole number in local storage: ${parsed}`);
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading stored hole number:', error);
    }
    
    // Find the first hole that doesn't have a score or the last scored hole + 1
    let lastScoredHole = 0;
    let firstIncompleteHole = null;
    
    for (let i = 0; i < holeScores.length; i++) {
      const hole = holeScores[i];
      if (hole.score) {
        lastScoredHole = Math.max(lastScoredHole, hole.holeNumber);
      } else if (firstIncompleteHole === null) {
        firstIncompleteHole = hole.holeNumber;
      }
    }
    
    if (firstIncompleteHole !== null) {
      console.log(`First incomplete hole: ${firstIncompleteHole}`);
      return firstIncompleteHole;
    }
    
    // If all holes have scores or no holes have scores, go to first hole
    // If we have some completed holes, go to the next one
    if (lastScoredHole > 0 && lastScoredHole < holeCount) {
      console.log(`Continuing from hole ${lastScoredHole + 1} (after last scored hole)`);
      return lastScoredHole + 1;
    }
    
    console.log(`Starting at hole 1 (default)`);
    return 1;
  };

  const handleStartRound = () => {
    if (!roundId) {
      toast({
        title: "Error",
        description: "Round ID is missing. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    const nextHole = getNextHoleToPlay();
    console.log(`Starting/continuing round at hole ${nextHole}`);
    navigate(`/rounds/${roundId}/${nextHole}`);
  };
  
  const handleReview = () => {
    if (!roundId) {
      toast({
        title: "Error",
        description: "Round ID is missing. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
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
                <span className="font-semibold text-amber-600">In Progress</span>
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
