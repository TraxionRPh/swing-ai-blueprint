
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProgressChallengeProps {
  name: string;
  description: string;
  instructions: string[];
  planId?: string;
}

export const ProgressChallengeCard = ({ name, description, instructions, planId }: ProgressChallengeProps) => {
  const { toast } = useToast();
  const [initialScore, setInitialScore] = useState(() => {
    const saved = localStorage.getItem(`challenge-initial-${planId}`);
    return saved || '';
  });
  const [finalScore, setFinalScore] = useState(() => {
    const saved = localStorage.getItem(`challenge-final-${planId}`);
    return saved || '';
  });

  const handleSaveScore = (type: 'initial' | 'final', score: string) => {
    if (planId) {
      localStorage.setItem(`challenge-${type}-${planId}`, score);
      toast({
        title: "Score Saved",
        description: `Your ${type} score has been saved.`
      });
    }
  };

  return (
    <Card className="bg-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ListTodo className="h-5 w-5" />
          <span>Progress Challenge: {name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        
        <div className="space-y-6">
          <div className="space-y-3">
            {instructions.map((instruction, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary font-medium flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground">{instruction}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Score</label>
              <div className="flex gap-2">
                <Input 
                  type="text" 
                  value={initialScore}
                  onChange={(e) => setInitialScore(e.target.value)}
                  placeholder="Enter your starting score"
                />
                <Button onClick={() => handleSaveScore('initial', initialScore)}>Save</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Final Score</label>
              <div className="flex gap-2">
                <Input 
                  type="text" 
                  value={finalScore}
                  onChange={(e) => setFinalScore(e.target.value)}
                  placeholder="Enter your final score"
                />
                <Button onClick={() => handleSaveScore('final', finalScore)}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
