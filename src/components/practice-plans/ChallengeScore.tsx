
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChallengeScoreProps {
  planId?: string;
  type: "initial" | "final";
  attempts?: number;
}

export const ChallengeScore = ({ planId, type }: ChallengeScoreProps) => {
  const { toast } = useToast();
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem(`challenge-${type}-${planId}`);
    return saved || '';
  });

  const handleSave = () => {
    if (!planId) {
      toast({
        title: "Error",
        description: "Cannot save score without a plan ID",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem(`challenge-${type}-${planId}`, score);
    toast({
      title: "Score Saved",
      description: `Your ${type} score of ${score}/${attempts} has been saved.`
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter your score out of 10 attempts:
      </p>
      <div className="flex gap-2">
        <Input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Enter Score"
          className="max-w-[200px]"
          min="0"
          max={10}
        />
        <Button onClick={handleSave}>Save Score</Button>
      </div>
    </div>
  );
};
