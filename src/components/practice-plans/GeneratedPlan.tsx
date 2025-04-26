
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { Check, CheckCircle, ChevronDown, ChevronUp, ListTodo } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

interface GeneratedPlanProps {
  plan: GeneratedPracticePlan;
  onClear: () => void;
  planDuration?: string;
  planId?: string;
}

export const GeneratedPlan = ({ plan, onClear, planDuration = "1", planId }: GeneratedPlanProps) => {
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(false);
  const [expandedDrills, setExpandedDrills] = useState<Record<string, boolean>>({});
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>({});
  const filteredSessions = plan.practicePlan.sessions.slice(0, parseInt(planDuration));
  
  const handleCompletePlan = () => {
    setIsCompleted(true);
    toast({
      title: "Plan Completed",
      description: "Congratulations on completing your practice plan!"
    });
  };

  const toggleDrillExpand = (drillName: string) => {
    setExpandedDrills(prev => ({
      ...prev,
      [drillName]: !prev[drillName]
    }));
  };

  const toggleDrillCompletion = (drillName: string) => {
    const newCompletedState = !completedDrills[drillName];
    
    setCompletedDrills(prev => ({
      ...prev,
      [drillName]: newCompletedState
    }));
    
    toast({
      title: newCompletedState ? "Drill Completed" : "Drill Marked Incomplete",
      description: newCompletedState ? 
        `You've completed the ${drillName} drill!` : 
        `You've marked ${drillName} as incomplete.`
    });
  };

  // Find the drill details by name
  const getDrillDetails = (drillName: string) => {
    return plan.recommendedDrills.find(drill => drill.name === drillName);
  };

  const getProgressChallengeInfo = () => {
    // Use the focus of the plan to create a relevant challenge
    const focusAreas = plan.recommendedDrills.flatMap(drill => drill.focus).filter(Boolean);
    const uniqueFocus = [...new Set(focusAreas)];
    const mainFocus = uniqueFocus[0] || "technique";
    
    return {
      name: `${plan.problem} Assessment`,
      description: `This challenge helps you measure your improvement in ${plan.problem.toLowerCase()}.`,
      instructions: [
        "Record your performance before starting the practice plan.",
        "Complete all drills in the practice plan over the specified duration.",
        "Repeat the assessment after completing the plan to measure your progress."
      ]
    };
  };

  const progressChallenge = getProgressChallengeInfo();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Practice Plan: {plan.problem}</h2>
        <Button variant="outline" onClick={onClear}>
          New Plan
        </Button>
      </div>
      
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-emerald-600" />
            <span>Progress Challenge: {progressChallenge.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{progressChallenge.description}</p>
          
          <div className="space-y-3">
            {progressChallenge.instructions.map((instruction, i) => (
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
                <div className="flex gap-2 flex-wrap">
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
          <CardTitle>{parseInt(planDuration) > 1 ? `${planDuration}-Day Practice Plan` : `1-Day Practice Plan`}</CardTitle>
          <CardDescription>
            Follow this plan to address your {plan.problem} issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <span className="font-medium">Recommended practice: </span>
            <span className="text-muted-foreground">{plan.practicePlan.frequency}, focusing on the drills below.</span>
          </div>
          
          {filteredSessions.map((session, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="bg-secondary/10 p-3 border-b">
                <h4 className="font-medium">Day {i+1}: {session.focus}</h4>
                <p className="text-xs text-muted-foreground">{session.duration}</p>
              </div>
              <div className="p-3">
                <ul className="space-y-3">
                  {session.drills.map((drillName, j) => {
                    const drillDetails = getDrillDetails(drillName);
                    
                    return (
                      <li key={j} className="border rounded-md overflow-hidden">
                        <div className="flex items-center p-3 bg-muted/30">
                          <Checkbox
                            id={`drill-${i}-${j}`}
                            checked={completedDrills[drillName]}
                            onCheckedChange={() => toggleDrillCompletion(drillName)}
                            className="mr-3"
                          />
                          <div 
                            className="flex-1 cursor-pointer" 
                            onClick={() => toggleDrillExpand(drillName)}
                          >
                            <div className="flex justify-between items-center">
                              <label 
                                htmlFor={`drill-${i}-${j}`}
                                className={`text-sm font-medium ${completedDrills[drillName] ? 'text-muted-foreground line-through' : ''}`}
                              >
                                {drillName}
                              </label>
                              {expandedDrills[drillName] ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Collapsible open={expandedDrills[drillName]} className="w-full">
                          <CollapsibleContent className="p-3 bg-background">
                            {drillDetails && (
                              <div className="space-y-3">
                                <p className="text-sm">{drillDetails.description}</p>
                                
                                <div>
                                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Instructions</p>
                                  <ul className="space-y-2">
                                    <li className="text-sm flex items-start gap-2">
                                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">1</span>
                                      <span>Start with proper setup and alignment</span>
                                    </li>
                                    <li className="text-sm flex items-start gap-2">
                                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">2</span>
                                      <span>Focus on the specific movement pattern</span>
                                    </li>
                                    <li className="text-sm flex items-start gap-2">
                                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">3</span>
                                      <span>Practice with slow, deliberate repetitions</span>
                                    </li>
                                  </ul>
                                </div>
                                
                                <div>
                                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Duration</p>
                                  <p className="text-sm">{drillDetails.duration}</p>
                                </div>
                                
                                <div>
                                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Focus Areas</p>
                                  <div className="flex flex-wrap gap-1">
                                    {drillDetails.focus.map(area => (
                                      <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
          
          <Card className="bg-accent/10 border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Complete the Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                After completing all the drills in your plan, do the {progressChallenge.name} again to measure your progress.
              </p>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClear}>Back</Button>
          {!isCompleted && (
            <Button 
              onClick={handleCompletePlan}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Complete Plan
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
