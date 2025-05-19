
import { useState } from 'react';
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { HandicapLevel } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { usePracticePlanGeneration } from './usePracticePlanGeneration';
import { useAPIUsageCheck } from './useAPIUsageCheck';
import { supabase } from "@/integrations/supabase/client";

export const useAIAnalysis = () => {
  const { generatePlan: generatePracticePlan, isGenerating: isPlanGenerating } = usePracticePlanGeneration();
  const { checkAPIUsage } = useAPIUsageCheck();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiUsageInfo, setApiUsageInfo] = useState<{
    currentUsage?: number;
    dailyLimit?: number;
  }>({});

  const generatePlan = async (
    userId: string | undefined,
    issue: string, 
    handicapLevel: HandicapLevel, 
    planDuration: string = "1"
  ): Promise<GeneratedPracticePlan> => {
    try {
      console.log("Generating practice plan:", { userId, issue, handicapLevel, planDuration });
      setIsAnalyzing(true);
      
      // Check if the user has API usage available and get usage info
      // Use supabase client instead of direct fetch to ensure proper auth headers
      const { data: apiData, error: apiError } = await supabase.functions.invoke('check-api-usage', {
        body: { 
          user_id: userId, 
          type: 'ai_analysis' 
        }
      });
      
      if (apiError) {
        console.error("API usage check error:", apiError);
        toast({
          title: "Service Unavailable",
          description: "Unable to check API usage. Please try again later.",
          variant: "destructive"
        });
        throw new Error("Failed to check API usage");
      }
      
      if (apiData && apiData.currentUsage !== undefined && apiData.dailyLimit !== undefined) {
        setApiUsageInfo({
          currentUsage: apiData.currentUsage,
          dailyLimit: apiData.dailyLimit
        });
      }
      
      if (!apiData?.success || apiData?.limitReached) {
        toast({
          title: "API Limit Reached",
          description: apiData?.message || "You've reached your limit of AI-powered analyses in the last 24 hours. Upgrade to premium for unlimited access.",
          variant: "destructive"
        });
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
    isGenerating: isPlanGenerating || isAnalyzing,
    apiUsageInfo
  };
};
