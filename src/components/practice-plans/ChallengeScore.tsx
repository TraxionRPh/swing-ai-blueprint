
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";

interface ChallengeScoreProps {
  planId?: string;
  type: "initial" | "final";
  attempts?: number;
}

export const ChallengeScore = ({ planId, type, attempts = 10 }: ChallengeScoreProps) => {
  const { toast } = useToast();
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem(`challenge-${type}-${planId}`);
    return saved || '';
  });

  const handleSave = () => {
    if (planId) {
      localStorage.setItem(`challenge-${type}-${planId}`, score);
      toast({
        title: "Score Saved",
        description: `Your ${type} score has been saved.`
      });
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-base font-medium">Your Score (out of {attempts})</h3>
      <Input
        type="number"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder={`Enter score (0-${attempts})`}
        min="0"
        max={attempts}
        className="max-w-full"
      />
      <p className="text-sm text-muted-foreground">
        Enter how many successful attempts you had
      </p>
      <Button onClick={handleSave} className="w-full">
        <Trophy className="mr-2 h-5 w-5" /> Complete Challenge
      </Button>
    </div>
  );
};
