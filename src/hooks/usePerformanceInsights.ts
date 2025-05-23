
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PerformanceInsight, GeneratedPracticePlan } from "@/types/practice-plan";
import { useToast } from "@/hooks/use-toast";

interface UsePerformanceInsightsResult {
  isLoading: boolean;
  error: string | null;
  strongPoints: PerformanceInsight[];
  areasForImprovement: PerformanceInsight[];
  isUsingFallbackData: boolean;
}

export const usePerformanceInsights = (): UsePerformanceInsightsResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [strongPoints, setStrongPoints] = useState<PerformanceInsight[]>([]);
  const [areasForImprovement, setAreasForImprovement] = useState<PerformanceInsight[]>([]);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPerformanceInsights = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No authenticated user found');
          setIsUsingFallbackData(true);
          setIsLoading(false);
          return;
        }

        // First, check if we have rounds data to analyze
        const { data: roundsData, error: roundsError } = await supabase
          .from('rounds')
          .select('id, total_score, fairways_hit, greens_in_regulation, total_putts')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (roundsError) {
          console.error('Error fetching rounds:', roundsError);
        }
        
        // Check if we have enough rounds data for meaningful insights
        const hasEnoughRounds = roundsData && roundsData.length >= 3;
        
        if (hasEnoughRounds) {
          console.log(`Found ${roundsData.length} rounds to analyze for insights`);
        } else {
          console.log(`Not enough rounds data: ${roundsData?.length || 0} rounds found`);
        }

        // Fetch the latest AI practice plan for the user
        const { data: practicePlan, error: planError } = await supabase
          .from('ai_practice_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (planError) {
          console.error('Error fetching practice plans:', planError);
          setError('Failed to load performance insights');
          setIsUsingFallbackData(true);
          setIsLoading(false);
          return;
        }

        // Extract performance insights from practice plan data
        if (practicePlan && practicePlan.length > 0 && practicePlan[0].practice_plan) {
          // Type check to ensure practice_plan is an object with the expected structure
          const planData = practicePlan[0].practice_plan;
          
          if (typeof planData === 'object' && planData !== null) {
            // Safely access performanceInsights if it exists in the object
            const typedPlan = planData as Record<string, unknown>;
            const insights = typedPlan.performanceInsights as PerformanceInsight[] || [];
            
            if (insights && insights.length > 0) {
              console.log(`Found ${insights.length} performance insights from AI plan`);
              
              // Split insights into strengths and areas for improvement
              const strengths: PerformanceInsight[] = [];
              const improvements: PerformanceInsight[] = [];
              
              insights.forEach((insight: PerformanceInsight) => {
                if (insight.priority === 'Low') {
                  strengths.push(insight);
                } else {
                  improvements.push(insight);
                }
              });

              setStrongPoints(strengths);
              setAreasForImprovement(improvements);
              setIsUsingFallbackData(false);
            } else {
              console.log('No performance insights found in practice plan');
              setIsUsingFallbackData(true);
            }
          } else {
            console.log('Practice plan data is not in expected format');
            setIsUsingFallbackData(true);
          }
        } else {
          console.log('No practice plans or insights found');
          setIsUsingFallbackData(true);
        }
      } catch (error) {
        console.error('Error in usePerformanceInsights:', error);
        setError('An error occurred while loading insights');
        setIsUsingFallbackData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceInsights();
  }, [toast]);

  return { isLoading, error, strongPoints, areasForImprovement, isUsingFallbackData };
};
