
import { Separator } from "@/components/ui/separator";
import { commonGolfGoals } from "./CommonGoals";

interface ProfileSummaryStepProps {
  handicap: string;
  goals: string;
  selectedGoals: string[];
  scoreGoal: number | null;
}

const ProfileSummaryStep = ({ handicap, goals, selectedGoals, scoreGoal }: ProfileSummaryStepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-medium">Your SwingAI Profile</h3>
      
      <div className="space-y-2">
        <p className="font-medium">Skill Level:</p>
        <p className="text-muted-foreground capitalize">{handicap}</p>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <p className="font-medium">Selected Goals:</p>
        <ul className="space-y-2 text-muted-foreground">
          {selectedGoals.map((goalId) => {
            const goal = commonGolfGoals.find(g => g.id === goalId);
            if (!goal) return null;
            return (
              <li key={goalId} className="flex items-center gap-2">
                <goal.icon className="h-4 w-4" />
                <span>{goal.label}</span>
                {goalId === "lower-score" && scoreGoal && (
                  <span className="text-sm">(Target: {scoreGoal})</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      
      {goals && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="font-medium">Additional Goals:</p>
            <p className="text-muted-foreground">{goals}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileSummaryStep;
