
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain } from "lucide-react";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { PracticePlanForm } from "@/components/practice-plans/PracticePlanForm";
import { GeneratedPlan } from "@/components/practice-plans/GeneratedPlan";
import { CommonProblem } from "@/types/practice-plan";
import { Loading } from "@/components/ui/loading";

const commonProblems: CommonProblem[] = [
  {
    id: 1,
    problem: "Slicing my driver",
    description: "Ball starts straight but curves severely right (for right-handed golfers)",
    popularity: "Very Common"
  },
  {
    id: 2,
    problem: "Chunking iron shots",
    description: "Hitting the ground before the ball, resulting in fat shots",
    popularity: "Common"
  },
  {
    id: 3,
    problem: "Three-putting",
    description: "Taking three or more putts to complete a hole",
    popularity: "Very Common"
  },
  {
    id: 4,
    problem: "Topped shots",
    description: "Hitting the top half of the ball, causing low-flying shots",
    popularity: "Common"
  },
  {
    id: 5,
    problem: "Shanking",
    description: "Ball striking the hosel, causing it to shoot right at a sharp angle",
    popularity: "Less Common"
  },
  {
    id: 6,
    problem: "Inconsistent ball striking",
    description: "Variable contact quality leading to unpredictable distances",
    popularity: "Very Common"
  }
];

const AIPracticePlans = () => {
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();
  const { 
    generateAnalysis, 
    isGenerating: isAnalyzing,
    latestPracticePlan,
    generatePracticePlan,
    isGeneratingPlan,
    isLoadingPracticePlan
  } = useAIAnalysis();
  
  const handleSubmit = () => {
    if (!inputValue.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your golf issue or select from common problems.",
        variant: "destructive"
      });
      return;
    }
    
    generatePracticePlan(inputValue);
  };
  
  const handleSelectProblem = (problem: string) => {
    setInputValue(problem);
  };
  
  const handleClear = () => {
    setInputValue("");
  };

  if (isLoadingPracticePlan) {
    return <Loading message="Loading your practice plan data..." />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice Plans</h1>
        <p className="text-muted-foreground mb-4">
          Get personalized practice plans based on your performance
        </p>
        <Button
          onClick={() => generateAnalysis()}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Brain className="mr-2 h-4 w-4" />
          {isAnalyzing ? "Analyzing Your Data..." : "Generate AI Practice Plan"}
        </Button>
      </div>
      
      {!latestPracticePlan || inputValue ? (
        <PracticePlanForm
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={handleSubmit}
          onSelectProblem={handleSelectProblem}
          isGenerating={isGeneratingPlan}
          commonProblems={commonProblems}
        />
      ) : (
        <GeneratedPlan
          plan={latestPracticePlan}
          onClear={handleClear}
        />
      )}
    </div>
  );
};

export default AIPracticePlans;
