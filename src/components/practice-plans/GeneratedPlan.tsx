
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { Button } from "@/components/ui/button";
import { DiagnosisCard } from "./DiagnosisCard";
import { DailyPlanSection } from "./DailyPlanSection";
import { ArrowLeft } from "lucide-react";
import { useChallenge } from "@/hooks/useChallenge";
import { ProgressChallengeCard } from "./ProgressChallengeCard";

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
  
  // Use first recommended drill for finding a matching challenge
  const focusArea = plan.recommendedDrills && plan.recommendedDrills.length > 0 && plan.recommendedDrills[0]?.focus?.[0] || "driving"; 
  const { data: challengeData, isLoading: challengeLoading } = useChallenge("1");

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

  // Process the plan data to ensure we have valid plan days
  let planData = [];
  if (plan.practicePlan?.plan && Array.isArray(plan.practicePlan.plan)) {
    planData = plan.practicePlan.plan;
  }

  const durationNum = parseInt(planDuration) || 1;
  const filteredDays = planData.slice(0, durationNum);
  const challengeName = challengeData?.title || `${plan.problem} Challenge`;
  const challengeInstructions = challengeData ? 
    [challengeData.instruction1, challengeData.instruction2, challengeData.instruction3].filter(Boolean) : 
    ["Complete the challenge to track your progress"];

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onClear} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Plans
      </Button>
      
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
      <ProgressChallengeCard
        name={challengeName}
        description="Complete this challenge to measure your current skill level"
        instructions={challengeInstructions}
        planId={planId}
      />
      
      {/* AI Diagnosis */}
      <DiagnosisCard diagnosis={plan.diagnosis} rootCauses={plan.rootCauses} />
      
      {/* Daily Plans */}
      {filteredDays && filteredDays.length > 0 ? (
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
        <Card className="border-amber-200">
          <CardContent className="p-6">
            <p className="text-amber-600">No daily practice plans available. Please try regenerating this plan.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Final Challenge */}
      <ProgressChallengeCard
        name={challengeName}
        description="Now that you've completed the practice plan, take the challenge again to measure your improvement"
        instructions={challengeInstructions}
        planId={planId}
      />
    </div>
  );
};
