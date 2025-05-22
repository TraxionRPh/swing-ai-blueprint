
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { GeneratedPlan } from "@/components/practice-plans/GeneratedPlan";
import { PracticePlanForm } from "@/components/practice-plans/PracticePlanForm";
import { Brain } from "@/components/icons/CustomIcons";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useProfile, HandicapLevel } from "@/hooks/useProfile";
import { CommonProblem } from "@/types/practice-plan";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ListTodo } from "lucide-react";
import { PremiumFeature } from "@/components/PremiumFeature";

const AIPracticePlans = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [planDuration, setPlanDuration] = useState("1");
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isManualAnalyzing, setIsManualAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { generatePlan, isGenerating } = useAIAnalysis();
  const { handicap, firstName } = useProfile();

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

  const generateAnalysis = async (isAI: boolean) => {
    if (!isAI && !inputValue.trim() && !handicap) {
      toast({
        title: "Missing Input",
        description: "Please describe your golf issue or click the AI Generate button",
        variant: "destructive"
      });
      return;
    }

    if (isAI) {
      setIsAiAnalyzing(true);
    } else {
      setIsManualAnalyzing(true);
    }

    try {
      await generatePlan(user?.id, isAI ? "" : inputValue, handicap as HandicapLevel, planDuration);
      toast({
        title: "Practice Plan Generated",
        description: "AI has created a personalized practice plan for you"
      });
      
      // Navigate directly to the newly created plan
      navigate("/my-practice-plans", { state: { showLatest: true } });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate practice plan",
        variant: "destructive"
      });
      console.error("Error generating practice plan:", error);
    } finally {
      setIsAiAnalyzing(false);
      setIsManualAnalyzing(false);
    }
  };

  const handleSelectProblem = (problem: string) => {
    setInputValue(problem);
  };

  const handlePlanDurationChange = (duration: string) => {
    setPlanDuration(duration);
  };

  return (
    <PremiumFeature>
      <div className="container mx-auto space-y-6 p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold">AI Practice Plan Generator</h1>
            <p className="text-muted-foreground mb-4">
              Get personalized practice plans based on your performance
            </p>
          </div>
          
          <Button variant="outline" asChild className="w-full">
            <Link to="/my-practice-plans">
              <ListTodo className="mr-2 h-4 w-4" />
              My Plans
            </Link>
          </Button>
        </div>
        
        <PracticePlanForm
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={(isAI) => generateAnalysis(isAI)}
          onSelectProblem={handleSelectProblem}
          isAiGenerating={isAiAnalyzing}
          isManualGenerating={isManualAnalyzing}
          commonProblems={commonProblems}
          planDuration={planDuration}
          onPlanDurationChange={handlePlanDurationChange}
        />
      </div>
    </PremiumFeature>
  );
};

export default AIPracticePlans;
