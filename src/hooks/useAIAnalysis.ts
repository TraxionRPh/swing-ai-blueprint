
import { useState } from 'react';
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { HandicapLevel } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { usePracticePlanGeneration } from './usePracticePlanGeneration';
import { useAPIUsageCheck } from './useAPIUsageCheck';

export const useAIAnalysis = () => {
  const { generatePlan: generatePracticePlan, isGenerating: isPlanGenerating } = usePracticePlanGeneration();
  const { checkAPIUsage } = useAPIUsageCheck();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generatePlan = async (
    userId: string | undefined,
    issue: string, 
    handicapLevel: HandicapLevel, 
    planDuration: string = "1"
  ): Promise<GeneratedPracticePlan> => {
    try {
      console.log("Generating practice plan:", { userId, issue, handicapLevel, planDuration });
      setIsAnalyzing(true);
      
      // First check if the user has API usage available
      const canProceed = await checkAPIUsage(userId, 'practice_plan');
      if (!canProceed) {
        throw new Error("API usage limit reached");
      }

      // Use the renamed function with error handling
      const plan = await generatePracticePlan(userId, issue, handicapLevel, planDuration);
      console.log("Plan generated successfully:", plan);
      return plan;
    } catch (error) {
      console.error("Error in AI analysis:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze your golf performance.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    generatePlan, 
    isGenerating: isPlanGenerating || isAnalyzing
  };
};
