
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { Button } from "@/components/ui/button";
import { DiagnosisCard } from "./DiagnosisCard";
import { DailyPlanSection } from "./DailyPlanSection";
import { ArrowLeft } from "lucide-react";
import { ChallengeScore } from "./ChallengeScore";
import { Challenge } from "@/types/challenge";
import { useToast } from "@/hooks/use-toast";

interface GeneratedPlanProps {
  plan: GeneratedPracticePlan;
  onClear: () => void;
  planDuration?: string;
  planId?: string;
}

export const GeneratedPlan = ({ plan, onClear, planDuration = "1", planId }: GeneratedPlanProps) => {
  const { toast } = useToast();
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
  
  console.log("Plan data:", planData);
  console.log("Filtered days:", filteredDays);
  console.log("Recommended drills:", plan.recommendedDrills);
  
  // Map drill IDs to actual drill objects for daily plans
  filteredDays.forEach(day => {
    if (day.drills) {
      day.drills.forEach(drillWithSets => {
        if (drillWithSets.drill && typeof drillWithSets.drill === 'string') {
          // Find the drill object from recommended drills
          const matchingDrill = plan.recommendedDrills.find(d => d.id === drillWithSets.drill);
          if (matchingDrill) {
            drillWithSets.drill = matchingDrill;
          }
        } else if (drillWithSets.id && !drillWithSets.drill) {
          // If we just have an ID, try to find the drill
          const matchingDrill = plan.recommendedDrills.find(d => d.id === drillWithSets.id);
          if (matchingDrill) {
            drillWithSets.drill = matchingDrill;
          }
        }
      });
    }
  });

  // Extract challenge data with fallbacks for missing fields
  const challenge = plan.practicePlan.challenge as Challenge;
  
  // Create a default challenge if none exists
  const defaultChallenge: Challenge = {
    id: "default-challenge",
    title: "Golf Skill Challenge",
    description: "Test your improvement with this personalized challenge",
    difficulty: "Medium",
    category: "General", 
    metrics: ["Accuracy"],
    metric: "Accuracy",
    instruction1: "Complete the recommended practice drills",
    instruction2: "Apply the techniques in a controlled environment",
    instruction3: "Measure your improvement",
    attempts: 10
  };

  // Category-specific default challenges
  if (!challenge || Object.keys(challenge).length === 0) {
    if (plan.problem.toLowerCase().includes('putt')) {
      defaultChallenge.title = "Putting Accuracy Challenge";
      defaultChallenge.description = "Test your putting accuracy and consistency";
      defaultChallenge.category = "Putting";
      defaultChallenge.metrics = ["Putts Made"];
      defaultChallenge.metric = "Putts Made";
      defaultChallenge.instruction1 = "Set up 10 putts at 3 feet distance";
      defaultChallenge.instruction2 = "Count how many you make successfully";
      defaultChallenge.instruction3 = "Calculate your make percentage";
    } else if (plan.problem.toLowerCase().includes('driv') || plan.problem.toLowerCase().includes('slice') || plan.problem.toLowerCase().includes('hook')) {
      defaultChallenge.title = "Fairway Accuracy Challenge";
      defaultChallenge.description = "Test your ability to hit fairways consistently with your driver";
      defaultChallenge.category = "Driving";
      defaultChallenge.metrics = ["Fairways Hit"];
      defaultChallenge.metric = "Fairways Hit";
      defaultChallenge.instruction1 = "Hit 10 drives aiming for the fairway";
      defaultChallenge.instruction2 = "Count how many land in the fairway";
      defaultChallenge.instruction3 = "Calculate your percentage of fairways hit";
    } else if (plan.problem.toLowerCase().includes('chip') || plan.problem.toLowerCase().includes('short game')) {
      defaultChallenge.title = "Short Game Proximity Challenge";
      defaultChallenge.description = "Test your ability to chip close to the pin";
      defaultChallenge.category = "Short Game";
      defaultChallenge.metrics = ["Proximity"];
      defaultChallenge.metric = "Proximity";
      defaultChallenge.instruction1 = "Chip 10 balls from 20 yards to a target";
      defaultChallenge.instruction2 = "Measure the distance of each shot from the target";
      defaultChallenge.instruction3 = "Calculate your average proximity to the target";
    }
  }

  // Use the challenge from the plan or the default challenge
  const displayChallenge = challenge && Object.keys(challenge).length > 0 ? challenge : defaultChallenge;
  
  // If the challenge doesn't have attempts, calculate it based on instructions
  if (!displayChallenge.attempts) {
    const instructionCount = [
      displayChallenge.instruction1, 
      displayChallenge.instruction2, 
      displayChallenge.instruction3
    ].filter(Boolean).length;
    
    displayChallenge.attempts = instructionCount > 0 ? instructionCount * 3 : 9;
  }

  // For development, display a notification if using default challenge
  if (!challenge || Object.keys(challenge).length === 0) {
    console.warn("Using default challenge because no challenge was provided in the plan");
  }

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
            <span>Initial Challenge: {displayChallenge.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{displayChallenge.description}</p>
          <div className="space-y-4">
            {displayChallenge.instruction1 && <p>1. {displayChallenge.instruction1}</p>}
            {displayChallenge.instruction2 && <p>2. {displayChallenge.instruction2}</p>}
            {displayChallenge.instruction3 && <p>3. {displayChallenge.instruction3}</p>}
          </div>
          <div className="mt-4">
            <ChallengeScore planId={planId} type="initial" attempts={displayChallenge.attempts} />
          </div>
        </CardContent>
      </Card>

      {/* AI Diagnosis */}
      <DiagnosisCard 
        diagnosis={plan.diagnosis} 
        rootCauses={plan.rootCauses} 
        isAIGenerated={plan.isAIGenerated}
      />

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
          <CardTitle>Final Challenge: {displayChallenge.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Complete this challenge again to measure your improvement
          </p>
          <div className="space-y-4">
            {displayChallenge.instruction1 && <p>1. {displayChallenge.instruction1}</p>}
            {displayChallenge.instruction2 && <p>2. {displayChallenge.instruction2}</p>}
            {displayChallenge.instruction3 && <p>3. {displayChallenge.instruction3}</p>}
          </div>
          <div className="mt-4">
            <ChallengeScore planId={planId} type="final" attempts={displayChallenge.attempts} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
