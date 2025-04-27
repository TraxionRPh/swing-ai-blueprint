
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { Button } from "@/components/ui/button";
import { DiagnosisCard } from "./DiagnosisCard";
import { DailyPlanSection } from "./DailyPlanSection";
import { ArrowLeft } from "lucide-react";
import { ChallengeScore } from "./ChallengeScore";
import { Challenge } from "@/types/challenge";

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

  const challenge = plan.practicePlan.challenge as Challenge;
  const hasChallenge = challenge && Object.keys(challenge).length > 0;

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
          <CardTitle className="flex justify-between items-center">
            <span>Initial Challenge: {hasChallenge ? challenge.title : 'No challenge available'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasChallenge ? (
            <>
              <p className="text-muted-foreground mb-4">{challenge.description}</p>
              <div className="space-y-4">
                {challenge.instruction1 && <p>1. {challenge.instruction1}</p>}
                {challenge.instruction2 && <p>2. {challenge.instruction2}</p>}
                {challenge.instruction3 && <p>3. {challenge.instruction3}</p>}
              </div>
              <ChallengeScore planId={planId} type="initial" attempts={challenge.attempts} />
            </>
          ) : (
            <p className="text-muted-foreground">No relevant challenge found for this practice plan.</p>
          )}
        </CardContent>
      </Card>

      {/* AI Diagnosis */}
      <DiagnosisCard diagnosis={plan.diagnosis} rootCauses={plan.rootCauses} />

      {/* Daily Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Drills Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {filteredDays.length > 0 ? (
            filteredDays.map((dayPlan, i) => (
              <DailyPlanSection
                key={i}
                dayPlan={dayPlan}
                dayNumber={i + 1}
                completedDrills={completedDrills}
                onDrillComplete={toggleDrillCompletion}
              />
            ))
          ) : (
            <p className="text-muted-foreground">No drills available for this practice plan.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Final Challenge */}
      <Card>
        <CardHeader>
          <CardTitle>Final Challenge: {hasChallenge ? challenge.title : 'No challenge available'}</CardTitle>
        </CardHeader>
        <CardContent>
          {hasChallenge ? (
            <>
              <p className="text-muted-foreground mb-4">
                Complete this challenge again to measure your improvement
              </p>
              <ChallengeScore planId={planId} type="final" attempts={challenge.attempts} />
            </>
          ) : (
            <p className="text-muted-foreground">No relevant challenge found for this practice plan.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
