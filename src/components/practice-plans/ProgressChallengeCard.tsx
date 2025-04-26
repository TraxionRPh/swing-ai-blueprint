
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

interface ProgressChallengeProps {
  name: string;
  description: string;
  instructions: string[];
}

export const ProgressChallengeCard = ({ name, description, instructions }: ProgressChallengeProps) => {
  return (
    <Card className="bg-background border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ListTodo className="h-5 w-5" />
          <span>Progress Challenge: {name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        
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
      </CardContent>
    </Card>
  );
};
