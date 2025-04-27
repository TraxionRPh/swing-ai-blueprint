
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { Button } from "@/components/ui/button";
import { DiagnosisCard } from "./DiagnosisCard";
import { DailyPlanSection } from "./DailyPlanSection";
import { ArrowLeft } from "lucide-react";
import { ChallengeScore } from "./ChallengeScore";

interface GeneratedPlanProps {
  plan: GeneratedPracticePlan;
  onClear: () => void;
  planDuration?: string;
  planId?: string;
}

export const GeneratedPlan = ({ plan, onClear, planDuration = "1", planId }: GeneratedPlanProps) => {
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`completed-drills-${planId}`);
    return saved ? JSON.parse(saved) : {};
  });

  const toggleDrillCompletion = (drillName: string) => {
    const newCompletedState = !completedDrills[drillName];
    setCompletedDrills(prev => ({
      ...prev,
      [drillName]: newCompletedState
    }));
    localStorage.setItem(`completed-drills-${planId}`, JSON.stringify({
      ...completedDrills,
      [drillName]: newCompletedState
    }));
  };

  // Process the plan data
  const planData = plan.practicePlan?.plan && Array.isArray(plan.practicePlan.plan) 
    ? plan.practicePlan.plan 
    : [];
  const durationNum = parseInt(planDuration) || 1;
  const filteredDays = planData.slice(0, durationNum);

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onClear} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Plans
      </Button>
      
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Practice Plan: {plan.problem}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This practice plan is designed to improve your {plan.problem.toLowerCase()} through targeted drills and exercises.
            Complete the recommended drills over {planDuration} {parseInt(planDuration) === 1 ? 'day' : 'days'} to see improvement.
          </p>
        </CardContent>
      </Card>
      
      {/* Initial Challenge */}
      <Card>
        <CardHeader>
          <CardTitle>Initial Challenge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Complete this challenge to measure your current skill level</p>
          <ChallengeScore planId={planId} type="initial" />
        </CardContent>
      </Card>
      
      {/* AI Diagnosis */}
      <DiagnosisCard diagnosis={plan.diagnosis} rootCauses={plan.rootCauses} />

      {/* Daily Plans */}
      {filteredDays.map((dayPlan, i) => (
        <DailyPlanSection
          key={i}
          dayPlan={dayPlan}
          dayNumber={i + 1}
          completedDrills={completedDrills}
          onDrillComplete={toggleDrillCompletion}
        />
      ))}
      
      {/* Final Challenge */}
      <Card>
        <CardHeader>
          <CardTitle>Final Challenge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Complete this challenge again to measure your improvement</p>
          <ChallengeScore planId={planId} type="final" />
        </CardContent>
      </Card>
    </div>
  );
};
