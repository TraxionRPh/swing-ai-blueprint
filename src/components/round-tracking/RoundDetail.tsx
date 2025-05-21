
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRound } from "@/context/round";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoundHeader } from "./RoundHeader";
import { LoadingState } from "./LoadingState";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Loading } from "@/components/ui/loading";

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
    setIsLoading,
    hasFetchError
  } = useRound();
  
  // Initialize with the round ID from the URL
  useEffect(() => {
    if (roundId && roundId !== currentRoundId) {
      console.log(`RoundDetail: Setting current round ID to: ${roundId}`);
      setCurrentRoundId(roundId);
    }
  }, [roundId, currentRoundId, setCurrentRoundId]);

  // Start the round at hole 1 (simplified approach)
  const handleStartRound = () => {
    if (!roundId) {
      toast({
        title: "Error",
        description: "Round ID is missing. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Starting round at hole 1`);
    
    // Save to storage for persistence
    try {
      sessionStorage.setItem('current-hole-number', '1');
      localStorage.setItem('current-hole-number', '1');
    } catch (error) {
      console.error('Error saving hole number to storage:', error);
    }
    
    navigate(`/rounds/${roundId}/1`);
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

  const handleRetryLoading = () => {
    if (roundId) {
      setIsLoading(true);
      window.location.reload();
    }
  };

  // If still loading after initial check
  if (isLoading) {
    return (
      <div className="space-y-6">
        <RoundHeader
          title={selectedCourse?.name || "Round Tracking"}
          subtitle={selectedCourse ? `${selectedCourse.city}, ${selectedCourse.state}` : "Loading round details..."}
          onBack={onBack}
        />
        <Loading message="Loading round details..." size="md" />
      </div>
    );
  }

  // Show error state if data failed to load
  if (hasFetchError) {
    return (
      <div className="space-y-6">
        <RoundHeader
          title="Round Tracking"
          subtitle="Connection Error"
          onBack={onBack}
        />
        
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Unable to load round data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              There was a problem connecting to the server. Check your internet connection and try again.
            </p>
            <Button onClick={handleRetryLoading}>
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
          <CardTitle>Round Details</CardTitle>
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
              {completedHoles === 0 ? "Start Round" : "Continue Round"}
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
