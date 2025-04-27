import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { HandicapLevel } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { usePracticePlanGeneration } from './usePracticePlanGeneration';

export const useAIAnalysis = () => {
  const { generatePlan, isGenerating } = usePracticePlanGeneration();
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

      const plan = await generatePlan(userId, issue, handicapLevel, planDuration);
      console.log("Plan generated successfully:", plan);

      if (userId) {
        const { error: saveError } = await supabase
          .from('ai_practice_plans')
          .insert({
            user_id: userId,
            problem: issue || 'General golf improvement',
            diagnosis: plan.diagnosis,
            root_causes: plan.rootCauses,
            recommended_drills: plan.recommendedDrills,
            practice_plan: plan
          });

        if (saveError) {
          console.error("Error saving practice plan:", saveError);
          toast({
            title: "Error Saving Plan",
            description: "Your plan was generated but couldn't be saved.",
            variant: "destructive"
          });
        } else {
          console.log("Practice plan saved successfully");
        }
      }

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
    isGenerating: isGenerating || isAnalyzing
  };
};
