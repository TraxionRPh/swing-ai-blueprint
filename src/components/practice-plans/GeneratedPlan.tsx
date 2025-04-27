
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedPracticePlan, DrillWithSets } from "@/types/practice-plan";
import { Button } from "@/components/ui/button";
import { DiagnosisCard } from "./DiagnosisCard";
import { DailyPlanSection } from "./DailyPlanSection";
import { ArrowLeft } from "lucide-react";
import { ChallengeScore } from "./ChallengeScore";
import { Challenge } from "@/types/challenge";
import { useToast } from "@/hooks/use-toast";
import { Drill } from "@/types/drill";

interface GeneratedPlanProps {
  plan: GeneratedPracticePlan;
  onClear: () => void;
  planDuration?: string;
  planId?: string;
}

// Challenge component extracted for better organization and reusability
const ChallengeCard = ({ 
  title, 
  description, 
  instructions, 
  attempts, 
  planId, 
  type 
}: { 
  title: string; 
  description: string;
  instructions: string[];
  attempts: number;
  planId?: string;
  type: "initial" | "final";
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex justify-between items-center">
        <span>{type === "initial" ? "Initial Challenge: " : "Final Challenge: "}{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground mb-4">{description}</p>
      <div className="space-y-4">
        {instructions.map((instruction, i) => 
          instruction && <p key={i}>{i + 1}. {instruction}</p>
        )}
      </div>
      <div className="mt-4">
        <ChallengeScore planId={planId} type={type} attempts={attempts} />
      </div>
    </CardContent>
  </Card>
);

export const GeneratedPlan = ({ plan, onClear, planDuration = "1", planId }: GeneratedPlanProps) => {
  const { toast } = useToast();
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`completed-drills-${planId}`);
    return saved ? JSON.parse(saved) : {};
  });

  // For debugging purposes - log plan data on mount and updates
  useEffect(() => {
    console.log("Plan loaded:", {
      problem: plan.problem,
      recommendedDrillsCount: plan.recommendedDrills?.length || 0,
      planDays: plan.practicePlan?.plan?.length || 0,
      challenge: plan.practicePlan?.challenge ? "Present" : "Missing"
    });
    
    // Detailed debug about plan days
    if (plan.practicePlan?.plan && Array.isArray(plan.practicePlan.plan)) {
      console.log("Plan days details:", plan.practicePlan.plan.map(day => ({
        day: day.day,
        focus: day.focus,
        drillCount: day.drills?.length || 0,
        drills: day.drills?.map(d => ({
          drillType: typeof d.drill,
          hasId: d.drill?.id ? true : false,
          drillTitle: d.drill?.title || 'Missing title'
        }))
      })));
    }
  }, [plan]);

  const toggleDrillCompletion = (drillName: string) => {
    const newCompletedState = !completedDrills[drillName];
    const updatedCompletionState = {
      ...completedDrills,
      [drillName]: newCompletedState
    };
    
    setCompletedDrills(updatedCompletionState);
    
    if (planId) {
      localStorage.setItem(`completed-drills-${planId}`, JSON.stringify(updatedCompletionState));
      
      // Give user feedback
      toast({
        title: newCompletedState ? "Drill completed!" : "Drill marked as incomplete",
        description: `${drillName} ${newCompletedState ? 'marked as completed' : 'marked as not completed'}`,
        variant: "default"
      });
    }
  };

  // Process and validate the plan data
  const processedPlanDays = usePlanData(plan, planDuration);
  
  // Prepare challenge data
  const displayChallenge = useChallenge(plan.problem, plan.practicePlan.challenge);

  // Extract challenge instructions for the component
  const challengeInstructions = [
    displayChallenge.instruction1,
    displayChallenge.instruction2,
    displayChallenge.instruction3
  ].filter(Boolean);

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
      <ChallengeCard
        title={displayChallenge.title}
        description={displayChallenge.description}
        instructions={challengeInstructions}
        attempts={displayChallenge.attempts || 9}
        planId={planId}
        type="initial"
      />

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
          {processedPlanDays.length > 0 ? (
            processedPlanDays.map((dayPlan, i) => (
              <DailyPlanSection
                key={`day-${i+1}-${dayPlan.day}`}
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
      <ChallengeCard
        title={displayChallenge.title}
        description="Complete this challenge again to measure your improvement"
        instructions={challengeInstructions}
        attempts={displayChallenge.attempts || 9}
        planId={planId}
        type="final"
      />
    </div>
  );
};

/**
 * Custom hook to validate and process plan day data
 */
function usePlanData(plan: GeneratedPracticePlan, planDuration: string = "1") {
  // Extract and validate plan days
  const planData = plan.practicePlan?.plan && Array.isArray(plan.practicePlan.plan) 
    ? plan.practicePlan.plan 
    : [];
  
  const durationNum = parseInt(planDuration) || 1;
  let filteredDays = planData.slice(0, durationNum);
  
  // Further validation and processing of drill data
  return filteredDays.map(day => {
    // Ensure drills array exists and is valid
    const drills = Array.isArray(day.drills) 
      ? day.drills.filter(drill => drill && drill.drill)
      : [];
    
    // Create a new day object with validated drills
    return {
      ...day,
      drills: drills.map(drillWithSets => {
        // If drill is still a string ID, try to find the corresponding drill object
        if (typeof drillWithSets.drill === 'string') {
          const drillId = drillWithSets.drill;
          const matchingDrill = plan.recommendedDrills.find(d => d.id === drillId);
          
          if (matchingDrill) {
            return {
              ...drillWithSets,
              drill: matchingDrill,
              id: matchingDrill.id // Ensure ID is set
            };
          } else {
            console.warn(`Could not find drill with ID ${drillId}`);
            return null;
          }
        }
        
        // If it's already an object, ensure it has an ID
        if (drillWithSets.drill && typeof drillWithSets.drill === 'object') {
          return {
            ...drillWithSets,
            id: drillWithSets.drill.id // Make sure ID is set
          };
        }
        
        return null;
      }).filter(Boolean) // Remove null values
    };
  });
}

/**
 * Custom hook to handle challenge data
 */
function useChallenge(problem: string, providedChallenge?: Challenge) {
  // Create category-specific default challenges based on the problem
  const defaultChallenge = getDefaultChallenge(problem);
  
  // Use the challenge from the plan or the default challenge
  const displayChallenge = providedChallenge && Object.keys(providedChallenge).length > 0 
    ? providedChallenge 
    : defaultChallenge;
  
  // If attempts not provided, calculate based on instructions
  if (!displayChallenge.attempts) {
    const instructionCount = [
      displayChallenge.instruction1, 
      displayChallenge.instruction2, 
      displayChallenge.instruction3
    ].filter(Boolean).length;
    
    displayChallenge.attempts = instructionCount > 0 ? instructionCount * 3 : 9;
  }

  // For development, log a warning if using default challenge
  if (!providedChallenge || Object.keys(providedChallenge).length === 0) {
    console.warn("Using default challenge because no challenge was provided in the plan");
  }
  
  return displayChallenge;
}

// Helper function to create appropriate default challenges
function getDefaultChallenge(problem: string): Challenge {
  // Base default challenge
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

  const lowerProblem = problem.toLowerCase();
  
  if (lowerProblem.includes('putt')) {
    defaultChallenge.title = "Putting Accuracy Challenge";
    defaultChallenge.description = "Test your putting accuracy and consistency";
    defaultChallenge.category = "Putting";
    defaultChallenge.metrics = ["Putts Made"];
    defaultChallenge.metric = "Putts Made";
    defaultChallenge.instruction1 = "Set up 10 putts at 3 feet distance";
    defaultChallenge.instruction2 = "Count how many you make successfully";
    defaultChallenge.instruction3 = "Calculate your make percentage";
  } 
  else if (lowerProblem.includes('driv') || lowerProblem.includes('slice') || lowerProblem.includes('hook')) {
    defaultChallenge.title = "Fairway Accuracy Challenge";
    defaultChallenge.description = "Test your ability to hit fairways consistently with your driver";
    defaultChallenge.category = "Driving";
    defaultChallenge.metrics = ["Fairways Hit"];
    defaultChallenge.metric = "Fairways Hit";
    defaultChallenge.instruction1 = "Hit 10 drives aiming for the fairway";
    defaultChallenge.instruction2 = "Count how many land in the fairway";
    defaultChallenge.instruction3 = "Calculate your percentage of fairways hit";
  } 
  else if (lowerProblem.includes('chip') || lowerProblem.includes('short game')) {
    defaultChallenge.title = "Short Game Proximity Challenge";
    defaultChallenge.description = "Test your ability to chip close to the pin";
    defaultChallenge.category = "Short Game";
    defaultChallenge.metrics = ["Proximity"];
    defaultChallenge.metric = "Proximity";
    defaultChallenge.instruction1 = "Chip 10 balls from 20 yards to a target";
    defaultChallenge.instruction2 = "Measure the distance of each shot from the target";
    defaultChallenge.instruction3 = "Calculate your average proximity to the target";
  }
  else if (lowerProblem.includes('iron') || lowerProblem.includes('approach')) {
    defaultChallenge.title = "Iron Shot Accuracy Challenge";
    defaultChallenge.description = "Test your iron shot accuracy and distance control";
    defaultChallenge.category = "Iron Play";
    defaultChallenge.metrics = ["Greens Hit"];
    defaultChallenge.metric = "Greens Hit";
    defaultChallenge.instruction1 = "Hit 10 iron shots to a specific target";
    defaultChallenge.instruction2 = "Count how many land within 20 feet of the target";
    defaultChallenge.instruction3 = "Calculate your accuracy percentage";
  }
  else if (lowerProblem.includes('sand') || lowerProblem.includes('bunker')) {
    defaultChallenge.title = "Bunker Escape Challenge";
    defaultChallenge.description = "Test your ability to escape bunkers consistently";
    defaultChallenge.category = "Bunker Play";
    defaultChallenge.metrics = ["Successful Escapes"];
    defaultChallenge.metric = "Successful Escapes";
    defaultChallenge.instruction1 = "Hit 10 bunker shots aiming to get out in one attempt";
    defaultChallenge.instruction2 = "Count how many successfully exit the bunker";
    defaultChallenge.instruction3 = "Calculate your bunker escape percentage";
  }
  
  return defaultChallenge;
}
