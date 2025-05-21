
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Confetti from "react-confetti";
import { useGoalAchievement } from "@/hooks/useGoalAchievement";
import GoalAchievementModal from "@/components/goals/GoalAchievementModal";
import { RoundSummaryCard } from "@/components/round-tracking/review/RoundSummaryCard";
import { HoleDetailsTable } from "@/components/round-tracking/review/HoleDetailsTable";
import { useRoundReviewData } from "@/hooks/round-tracking/useRoundReviewData";
import { useRoundCompletion } from "@/hooks/round-tracking/useRoundCompletion";
import { CardFooter } from "@/components/ui/card";

const RoundReview = () => {
  const navigate = useNavigate();
  const { roundId } = useParams<{ roundId: string }>();
  
  // Load round data using custom hook
  const { isLoading, holeScores, roundStats } = useRoundReviewData(roundId);
  
  // Handle round completion using custom hook
  const { completeRound, isSaving, showConfetti } = useRoundCompletion(
    roundId, 
    roundStats.totalScore,
    roundStats.totalHoles
  );
  
  // Import goal achievement hooks
  const { 
    achievedGoal, 
    resetAchievedGoal, 
    navigateToSetNewGoal 
  } = useGoalAchievement();
  
  if (isLoading) {
    return <Loading size="lg" message="Loading round summary..." />;
  }
  
  return (
    <div className="space-y-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
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
            onClick={() => completeRound({
              totalScore: roundStats.totalScore,
              totalPutts: roundStats.totalPutts,
              fairwaysHit: roundStats.fairwaysHit,
              greensInRegulation: roundStats.greensInRegulation
            })} 
            disabled={isSaving || holeScores.length === 0}
          >
            {isSaving ? <Loading size="sm" message="Saving..." inline /> : "Complete Round"}
          </Button>
        </CardFooter>
      </div>
      
      {/* Goal achievement modal */}
      {achievedGoal && (
        <GoalAchievementModal 
          achievedGoal={achievedGoal}
          onClose={resetAchievedGoal}
          onSetNewGoal={navigateToSetNewGoal}
        />
      )}
    </div>
  );
};

export default RoundReview;
