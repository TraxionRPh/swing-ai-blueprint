
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChallengeScoreProps {
  planId?: string;
  type: 'initial' | 'final';
}

export const ChallengeScore = ({ planId, type }: ChallengeScoreProps) => {
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
    <div className="flex gap-2">
      <Input
        type="number"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Enter your score"
        className="max-w-[200px]"
      />
      <Button onClick={handleSave}>Save Score</Button>
    </div>
  );
};
