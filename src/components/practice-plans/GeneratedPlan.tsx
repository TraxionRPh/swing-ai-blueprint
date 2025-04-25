
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeneratedPracticePlan } from "@/types/practice-plan";

interface GeneratedPlanProps {
  plan: GeneratedPracticePlan;
  onClear: () => void;
}

export const GeneratedPlan = ({ plan, onClear }: GeneratedPlanProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Practice Plan: {plan.problem}</h2>
        <Button variant="outline" onClick={onClear}>
          New Plan
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{plan.diagnosis}</p>
          
          <h3 className="font-medium mt-6 mb-2">Root Causes</h3>
          <ul className="list-disc pl-5 space-y-1">
            {plan.rootCauses.map((cause, i) => (
              <li key={i} className="text-muted-foreground">{cause}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recommended Drills</CardTitle>
          <CardDescription>
            Practice these drills to address your specific issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.recommendedDrills.map((drill, i) => (
            <div key={i} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{drill.name}</h4>
                <Badge>{drill.difficulty}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{drill.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {drill.focus.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{drill.duration}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Suggested Practice Plan</CardTitle>
          <CardDescription>
            Follow this plan for {plan.practicePlan.duration} to address your {plan.problem} issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <span className="font-medium">Recommended practice: </span>
            <span className="text-muted-foreground">{plan.practicePlan.frequency}, focusing on the drills below.</span>
          </div>
          
          {plan.practicePlan.sessions.map((session, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="bg-secondary/10 p-3 border-b">
                <h4 className="font-medium">Session {i+1}: {session.focus}</h4>
                <p className="text-xs text-muted-foreground">{session.duration}</p>
              </div>
              <div className="p-3">
                <ul className="space-y-2">
                  {session.drills.map((drill, j) => (
                    <li key={j} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span className="text-sm">{drill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <h4 className="font-medium mb-2">AI Tip</h4>
            <p className="text-sm text-muted-foreground">
              Record your practice sessions with your phone from both face-on and down-the-line angles. 
              This will help you track your progress and make necessary adjustments.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Save Plan</Button>
          <Button>Add to Practice Schedule</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
