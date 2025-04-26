
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { HandicapLevel } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

export const usePracticePlanGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const checkAPIUsage = async (userId: string | undefined) => {
    if (!userId) {
      toast({
        title: "Not Authorized",
        description: "Please log in to use AI features.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-api-usage', {
        body: { 
          user_id: userId, 
          type: 'ai_analysis' 
        }
      });

      if (error) {
        toast({
          title: "API Limit Reached",
          description: "You've reached your daily limit of 5 AI-powered analyses.",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error('API usage check failed:', err);
      toast({
        title: "Error",
        description: "Failed to check API usage. Please try again later.",
        variant: "destructive"
      });
      return false;
    }
  };

  const generatePlan = async (
    userId: string | undefined,
    issue: string, 
    handicapLevel?: HandicapLevel, 
    planDuration: string = "1"
  ): Promise<GeneratedPracticePlan> => {
    const canProceed = await checkAPIUsage(userId);
    if (!canProceed) {
      throw new Error('Daily API limit reached');
    }

    setIsGenerating(true);

    try {
      const { data: roundData } = await supabase
        .from('rounds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data, error } = await supabase.functions.invoke('analyze-golf-performance', {
        body: { 
          userId, 
          roundData: roundData || [],
          handicapLevel: handicapLevel || 'intermediate',
          specificProblem: issue || 'Improve overall golf performance',
          planDuration,
          includeProgressChallenge: true // Signal to include a challenge that measures progress
        }
      });

      if (error) throw error;

      // Ensure we have a complete practice plan structure with detailed drill information
      const practicePlan = data.practicePlan || {
        problem: issue || "Golf performance optimization",
        diagnosis: "AI analysis of your golf game",
        rootCauses: ["Technique", "Equipment"],
        recommendedDrills: [
          {
            name: "Alignment Drill",
            description: "Practice proper alignment with targets",
            difficulty: "Beginner",
            duration: "15 minutes",
            focus: ["Fundamentals", "Setup"],
            instructions: [
              "Set alignment sticks on the ground pointing at your target",
              "Place a club across your toes to ensure proper alignment",
              "Practice making swings while maintaining proper alignment"
            ]
          }
        ],
        practicePlan: {
          duration: `${planDuration} ${parseInt(planDuration) > 1 ? 'days' : 'day'}`,
          frequency: "Daily",
          sessions: [
            {
              focus: "Building Fundamentals",
              drills: ["Alignment Drill"],
              duration: "45 minutes"
            }
          ]
        },
        progressChallenge: {
          name: `${issue || "Golf Performance"} Assessment`,
          description: "Measure your improvement before and after completing this practice plan",
          steps: [
            "Record your current performance",
            "Complete all drills in the practice plan",
            "Re-test your performance to measure improvement"
          ]
        }
      };

      return practicePlan;
    } catch (error) {
      console.error("Error generating practice plan:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePlan, isGenerating };
};
