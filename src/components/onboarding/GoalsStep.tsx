
import { Textarea } from "@/components/ui/textarea";

interface GoalsStepProps {
  goals: string;
  setGoals: (value: string) => void;
}

const GoalsStep = ({ goals, setGoals }: GoalsStepProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-medium">What are your golf goals?</h3>
      <Textarea 
        placeholder="e.g., Lower my handicap, improve driving distance, better putting, etc."
        className="min-h-32"
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
      />
    </div>
  );
};

export default GoalsStep;
