
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { Button } from "@/components/ui/button";
import { DiagnosisCard } from "./DiagnosisCard";
import { DailyPlanSection } from "./DailyPlanSection";
import { ArrowLeft } from "lucide-react";
import { ChallengeScore } from "./ChallengeScore";
import { Challenge } from "@/types/challenge";
import { Badge } from "@/components/ui/badge";

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
      {hasChallenge && (
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">{challenge.title}</CardTitle>
              <Badge variant="outline" className="bg-slate-800 text-white border-slate-700">
                {challenge.difficulty || "Beginner"}
              </Badge>
            </div>
            <p className="text-slate-300 text-lg">{challenge.description}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Instructions</h2>
              <ol className="space-y-4 list-decimal list-inside">
                {challenge.instruction1 && <li className="text-lg">{challenge.instruction1}</li>}
                {challenge.instruction2 && <li className="text-lg">{challenge.instruction2}</li>}
                {challenge.instruction3 && <li className="text-lg">{challenge.instruction3}</li>}
              </ol>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Metrics</h2>
              <ChallengeScore planId={planId} type="initial" attempts={challenge.attempts} />
            </div>
          </CardContent>
        </Card>
      )}

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
      {hasChallenge && (
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Final Assessment: {challenge.title}</CardTitle>
            <p className="text-slate-300">
              Complete this challenge again to measure your improvement
            </p>
          </CardHeader>
          <CardContent>
            <ChallengeScore planId={planId} type="final" attempts={challenge.attempts} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
