
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
import { HoleDetailsTable } from "./review/HoleDetailsTable";
import { RoundSummaryCard } from "./review/RoundSummaryCard";
import { useRoundReviewData } from "@/hooks/round-tracking/useRoundReviewData";

interface RoundDetailProps {
  onBack: () => void;
}

export const RoundDetail = ({ onBack }: RoundDetailProps) => {
  const navigate = useNavigate();
  const { roundId } = useParams();
  const { toast } = useToast();
  
  // Fetch detailed round data directly using the hook
  const { isLoading, holeScores, roundStats } = useRoundReviewData(roundId);
  
  // For access to the current round context (needed for in-progress rounds)
  const { 
    currentRoundId,
    setCurrentRoundId,
    selectedCourse,
    hasFetchError,
    setIsLoading
  } = useRound();
  
  // Initialize with the round ID from the URL
  useEffect(() => {
    if (roundId && roundId !== currentRoundId) {
      console.log(`RoundDetail: Setting current round ID to: ${roundId}`);
      setCurrentRoundId(roundId);
    }
  }, [roundId, currentRoundId, setCurrentRoundId]);

  // Continue the round if it's in progress
  const handleContinueRound = () => {
    if (!roundId) {
      toast({
        title: "Error",
        description: "Round ID is missing. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to the first hole or the appropriate hole
    navigate(`/rounds/track/${roundId}/1`);
  };
  
  const handleRetryLoading = () => {
    if (roundId) {
      setIsLoading(true);
      window.location.reload();
    }
  };

  // If still loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <RoundHeader
          title={selectedCourse?.name || "Round Details"}
          subtitle="Loading round details..."
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
          title="Round Details"
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
  
  return (
    <div className="space-y-6">
      <RoundHeader
        title={roundStats.courseName || "Round Details"}
        subtitle={`${roundStats.date} - ${roundStats.totalScore} strokes (${roundStats.totalHoles} holes)`}
        onBack={onBack}
      />
      
      {/* Round Summary Statistics */}
      <RoundSummaryCard {...roundStats} />
      
      {/* Hole by Hole Details */}
      <HoleDetailsTable holeScores={holeScores} />
      
      {/* Back to List Button */}
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={onBack}>
          Back to Round History
        </Button>
      </div>
    </div>
  );
};
