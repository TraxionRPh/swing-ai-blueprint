
import { Textarea } from "@/components/ui/textarea";
import CommonGoals from "./CommonGoals";

interface GoalsStepProps {
  goals: string;
  setGoals: (value: string) => void;
  selectedGoals: string[];
  setSelectedGoals: (goals: string[]) => void;
  scoreGoal: number | null;
  setScoreGoal: (score: number | null) => void;
}

const GoalsStep = ({ 
  goals, 
  setGoals, 
  selectedGoals, 
  setSelectedGoals,
  scoreGoal,
  setScoreGoal
}: GoalsStepProps) => {
  const handleGoalToggle = (goalId: string, checked: boolean) => {
    if (checked) {
      setSelectedGoals([...selectedGoals, goalId]);
    } else {
      setSelectedGoals(selectedGoals.filter(g => g !== goalId));
      if (goalId === "lower-score") {
        setScoreGoal(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-medium">What are your golf goals?</h3>
      
      <CommonGoals
        selectedGoals={selectedGoals}
        scoreGoal={scoreGoal}
        onGoalToggle={handleGoalToggle}
        onScoreGoalChange={setScoreGoal}
      />
      
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Additional goals or notes (optional):</label>
        <Textarea 
          placeholder="Any other specific goals or details you'd like to share..."
          className="min-h-24"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
        />
      </div>
    </div>
  );
};

export default GoalsStep;
