
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ProgressChallengeCard } from "./ProgressChallengeCard";
import { DiagnosisCard } from "./DiagnosisCard";
import { RecommendedDrillsCard } from "./RecommendedDrillsCard";
import { DailyPlanCard } from "./DailyPlanCard";

interface GeneratedPlanProps {
  plan: GeneratedPracticePlan;
  onClear: () => void;
  planDuration?: string;
  planId?: string;
}

export const GeneratedPlan = ({ plan, onClear, planDuration = "1" }: GeneratedPlanProps) => {
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>({});
  
  // Safely access the plan.practicePlan.plan array with fallbacks to prevent 404 errors
  const planData = plan.practicePlan?.plan || [];
  const durationNum = parseInt(planDuration) || 1;
  const filteredDays = planData.slice(0, durationNum);
  
  const handleCompletePlan = () => {
    setIsCompleted(true);
    toast({
      title: "Plan Completed",
      description: "Congratulations on completing your practice plan!"
    });
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

  const getProgressChallengeInfo = () => {
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
      
      <ProgressChallengeCard {...progressChallenge} />
      <DiagnosisCard diagnosis={plan.diagnosis} rootCauses={plan.rootCauses} />
      <RecommendedDrillsCard drills={plan.recommendedDrills} />
      
      <Card>
        <div className="p-6 space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <span className="font-medium">Recommended practice: </span>
            <span className="text-muted-foreground">{plan.practicePlan?.frequency || 'Daily'}, focusing on the drills below.</span>
          </div>
          
          {filteredDays.length > 0 ? (
            filteredDays.map((dayPlan, i) => (
              <DailyPlanCard
                key={i}
                dayPlan={dayPlan}
                dayNumber={i + 1}
                completedDrills={completedDrills}
                onDrillComplete={toggleDrillCompletion}
              />
            ))
          ) : (
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-muted-foreground">No daily plan data available.</p>
            </div>
          )}
          
          <Card className="bg-accent/10 border-accent/20">
            <div className="p-4">
              <h3 className="text-base font-semibold mb-2">Complete the Challenge</h3>
              <p className="text-sm text-muted-foreground">
                After completing all the drills in your plan, do the {progressChallenge.name} again to measure your progress.
              </p>
            </div>
          </Card>
        </div>
        
        <div className="flex justify-between p-6 pt-0">
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
        </div>
      </Card>
    </div>
  );
};
