
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Goal, Check, ListCheck } from "lucide-react";
import { HandicapLevel } from "@/hooks/useProfile";

export const commonGolfGoals = [
  {
    id: "lower-score",
    label: "Lower my score",
    icon: Target,
    requiresNumber: true
  },
  {
    id: "consistency",
    label: "Improve consistency",
    icon: ListCheck,
    requiresNumber: false
  },
  {
    id: "technique",
    label: "Better technique",
    icon: Check,
    requiresNumber: false
  },
  {
    id: "handicap",
    label: "Lower my handicap",
    icon: Goal,
    requiresNumber: true
  }
] as const;

interface CommonGoalsProps {
  selectedGoals: string[];
  scoreGoal: number | null;
  handicapGoal: number | null;
  onGoalToggle: (goalId: string, checked: boolean) => void;
  onScoreGoalChange: (value: number | null) => void;
  onHandicapGoalChange: (value: number | null) => void;
}

const CommonGoals = ({ 
  selectedGoals, 
  scoreGoal, 
  handicapGoal,
  onGoalToggle, 
  onScoreGoalChange, 
  onHandicapGoalChange 
}: CommonGoalsProps) => {
  return (
    <div className="space-y-4">
      {commonGolfGoals.map((goal) => (
        <div key={goal.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
          <Checkbox
            id={goal.id}
            checked={selectedGoals.includes(goal.id)}
            onCheckedChange={(checked) => onGoalToggle(goal.id, checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <div className="flex items-center gap-2">
              <goal.icon className="h-4 w-4" />
              <Label htmlFor={goal.id} className="text-sm font-medium leading-none cursor-pointer">
                {goal.label}
              </Label>
            </div>
            {goal.id === "lower-score" && selectedGoals.includes(goal.id) && (
              <div className="mt-2 ml-6">
                <Label htmlFor="score-goal" className="text-sm text-muted-foreground">
                  What's your target score?
                </Label>
                <Input
                  id="score-goal"
                  type="number"
                  value={scoreGoal || ""}
                  onChange={(e) => onScoreGoalChange(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-24 mt-1"
                  min={30}
                  max={150}
                />
              </div>
            )}
            {goal.id === "handicap" && selectedGoals.includes(goal.id) && (
              <div className="mt-2 ml-6">
                <Label htmlFor="handicap-goal" className="text-sm text-muted-foreground">
                  What's your target handicap?
                </Label>
                <Input
                  id="handicap-goal"
                  type="number"
                  value={handicapGoal || ""}
                  onChange={(e) => onHandicapGoalChange(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-24 mt-1"
                  min={0}
                  max={36}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommonGoals;
