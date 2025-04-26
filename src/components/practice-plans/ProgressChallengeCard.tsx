
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

interface ProgressChallengeProps {
  name: string;
  description: string;
  instructions: string[];
}

export const ProgressChallengeCard = ({ name, description, instructions }: ProgressChallengeProps) => {
  return (
    <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-emerald-600" />
          <span>Progress Challenge: {name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        
        <div className="space-y-3">
          {instructions.map((instruction, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-sm text-emerald-700 font-medium flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-sm">{instruction}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
