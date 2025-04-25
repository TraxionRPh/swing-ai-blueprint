
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { GeneratedPlan } from "@/components/practice-plans/GeneratedPlan";
import { PracticePlanForm } from "@/components/practice-plans/PracticePlanForm";
import { Brain } from "@/components/icons/CustomIcons";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";

const AIPracticePlans = () => {
  const [inputValue, setInputValue] = useState("");
  const [latestPracticePlan, setLatestPracticePlan] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const { generatePracticePlan } = useAIAnalysis();

  const generateAnalysis = async () => {
    if (!inputValue.trim()) {
      toast({
        title: "Missing Input",
        description: "Please describe your golf issue",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const practicePlan = await generatePracticePlan(inputValue);
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

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">AI Practice Plan Generator</h1>
        <p className="text-muted-foreground mb-4">
          Get personalized practice plans based on your performance
        </p>
        <Button
          onClick={generateAnalysis}
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
          onSubmit={generateAnalysis}
          onSelectProblem={handleSelectProblem}
          isGenerating={isAnalyzing}
          commonProblems={[
            {
              id: 1,
              problem: "Slicing Driver",
              description: "Struggling with drives that curve right",
              popularity: "High"
            },
            {
              id: 2,
              problem: "Putting Inconsistency",
              description: "Difficulty maintaining consistent putting",
              popularity: "Medium"
            }
          ]}
        />
      ) : (
        <GeneratedPlan 
          plan={latestPracticePlan} 
          onClear={clearPlan} 
        />
      )}
    </div>
  );
};

export default AIPracticePlans;
