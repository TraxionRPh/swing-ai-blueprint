
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { GeneratedPlan } from "@/components/practice-plans/GeneratedPlan";
import { PracticePlanForm } from "@/components/practice-plans/PracticePlanForm";
import { Brain } from "@/components/icons/CustomIcons";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useProfile, HandicapLevel } from "@/hooks/useProfile";
import { CommonProblem } from "@/types/practice-plan";

const AIPracticePlans = () => {
  const [inputValue, setInputValue] = useState("");
  const [planDuration, setPlanDuration] = useState("1");
  const [latestPracticePlan, setLatestPracticePlan] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const { generatePracticePlan } = useAIAnalysis();
  const { handicap, firstName } = useProfile();

  // Expanded list of common golf problems
  const commonProblems: CommonProblem[] = [
    {
      id: 1,
      problem: "Slicing Driver",
      description: "Ball curves dramatically right (for right-handed golfers)",
      popularity: "High"
    },
    {
      id: 2,
      problem: "Inconsistent Putting",
      description: "Difficulty controlling distance and direction on the green",
      popularity: "High"
    },
    {
      id: 3,
      problem: "Topping the Ball",
      description: "Hitting the top half of the ball, resulting in a low shot",
      popularity: "Medium"
    },
    {
      id: 4,
      problem: "Chunking Iron Shots",
      description: "Hitting the ground before the ball, taking too much turf",
      popularity: "Medium"
    },
    {
      id: 5,
      problem: "Poor Bunker Play",
      description: "Difficulty getting out of sand traps consistently",
      popularity: "Medium"
    }
  ];

  const generateAnalysis = async () => {
    if (!inputValue.trim() && !handicap) {
      toast({
        title: "Missing Input",
        description: "Please describe your golf issue or click the AI Generate button",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Pass user skill level, selected problem and plan duration to the AI
      const practicePlan = await generatePracticePlan(inputValue, handicap as HandicapLevel, planDuration);
      setLatestPracticePlan(practicePlan);
      toast({
        title: "Practice Plan Generated",
        description: "AI has created a personalized practice plan for you"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate practice plan",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearPlan = () => {
    setLatestPracticePlan(null);
    setInputValue("");
  };

  const handleSelectProblem = (problem: string) => {
    setInputValue(problem);
  };

  const handlePlanDurationChange = (duration: string) => {
    setPlanDuration(duration);
  };

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">AI Practice Plan Generator</h1>
        <p className="text-muted-foreground mb-4">
          Get personalized practice plans based on your performance
        </p>
      </div>
      
      {!latestPracticePlan ? (
        <PracticePlanForm
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={generateAnalysis}
          onSelectProblem={handleSelectProblem}
          isGenerating={isAnalyzing}
          commonProblems={commonProblems}
          planDuration={planDuration}
          onPlanDurationChange={handlePlanDurationChange}
        />
      ) : (
        <GeneratedPlan 
          plan={latestPracticePlan} 
          onClear={clearPlan}
          planDuration={planDuration} 
        />
      )}
    </div>
  );
};

export default AIPracticePlans;
