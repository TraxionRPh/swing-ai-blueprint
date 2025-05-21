
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useGoalAchievement, AchievedGoal } from "@/hooks/useGoalAchievement";
import { RoundSummaryCard, HoleDetailsTable } from "@/components/round-tracking/review";
import { useRoundReviewData } from "@/hooks/round-tracking/useRoundReviewData";
import { useRoundCompletion } from "@/hooks/round-tracking/useRoundCompletion";
import { CardFooter } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface RoundReviewProps {
  onGoalAchieved?: (goal: AchievedGoal) => void;
}

const RoundReview = ({ onGoalAchieved }: RoundReviewProps) => {
  const navigate = useNavigate();
  const { roundId } = useParams<{ roundId: string }>();
  const [goalChecked, setGoalChecked] = useState(false);
  
  // Load round data using custom hook
  const { isLoading, holeScores, roundStats } = useRoundReviewData(roundId);
  
  // Handle round completion using custom hook
  const { 
    completeRound, 
    isSaving, 
    achievedGoal 
  } = useRoundCompletion(
    roundId, 
    roundStats.totalScore,
    roundStats.totalHoles
  );
  
  // Effect to notify parent of goal achievement after round completion
  useEffect(() => {
    // Only send the achievement to parent after saving is complete and we have an achievement
    if (!isSaving && achievedGoal && goalChecked && onGoalAchieved) {
      console.log("Round completed, notifying parent of goal achievement:", achievedGoal);
      onGoalAchieved(achievedGoal);
    }
  }, [isSaving, achievedGoal, goalChecked, onGoalAchieved]);
  
  // Handle round completion
  const handleCompleteRound = async () => {
    await completeRound({
      totalScore: roundStats.totalScore,
      totalPutts: roundStats.totalPutts,
      fairwaysHit: roundStats.fairwaysHit,
      greensInRegulation: roundStats.greensInRegulation
    });
    
    // Mark that we've checked goals after completion
    setGoalChecked(true);
  };
  
  if (isLoading) {
    return <Loading size="lg" message="Loading round summary..." />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Round Review</h1>
        <p className="text-muted-foreground">
          Review and submit your {roundStats.totalHoles}-hole round
        </p>
      </div>
      
      {/* Round Summary Card */}
      <RoundSummaryCard {...roundStats} />
      
      {/* Hole by Hole Table with Footer */}
      <div>
        <HoleDetailsTable holeScores={holeScores} />
        <CardFooter className="flex justify-between mt-4 border rounded-md p-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/rounds/track/${roundId}/${roundStats.totalHoles}`)}
          >
            Back to Scoring
          </Button>
          <Button 
            onClick={handleCompleteRound} 
            disabled={isSaving || holeScores.length === 0}
          >
            {isSaving ? <Loading size="sm" message="Saving..." inline /> : "Complete Round"}
          </Button>
        </CardFooter>
      </div>
    </div>
  );
};

export default RoundReview;
