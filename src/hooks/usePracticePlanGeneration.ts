
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
      // Fixed query: Using ILIKE with OR conditions instead of text search
      const searchTerms = issue.split(' ').filter(term => term.length > 2);
      
      let drillsQuery = supabase.from('drills').select('*');
      
      // Add ILIKE conditions for each search term
      if (searchTerms.length > 0) {
        const searchConditions = searchTerms.map(term => `focus::text ILIKE '%${term}%'`);
        drillsQuery = drillsQuery.or(searchConditions.join(','));
      }
      
      const { data: drills, error: drillsError } = await drillsQuery;

      if (drillsError) throw drillsError;

      const { data: roundData } = await supabase
        .from('rounds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Log details for debugging
      console.log('Fetched drills:', drills?.length || 0);
      console.log('Issue being analyzed:', issue);
      console.log('Sending request to analyze-golf-performance');

      const { data, error } = await supabase.functions.invoke('analyze-golf-performance', {
        body: { 
          userId, 
          roundData: roundData || [],
          handicapLevel: handicapLevel || 'intermediate',
          specificProblem: issue || 'Improve overall golf performance',
          planDuration,
          availableDrills: drills || []
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Received response from edge function:', data);
      
      // Create a default practice plan if data is missing
      const defaultPlan = {
        problem: issue || "Golf performance optimization",
        diagnosis: "AI analysis of your golf game",
        rootCauses: ["Technique", "Equipment"],
        recommendedDrills: drills || [],
        practicePlan: {
          duration: `${planDuration} ${parseInt(planDuration) > 1 ? 'days' : 'day'}`,
          frequency: "Daily",
          plan: Array.from({ length: parseInt(planDuration) }, (_, i) => ({
            day: i + 1,
            drills: (drills || []).slice(0, 3).map(drill => ({
              drill,
              sets: 3,
              reps: 10
            })),
            focus: "Building Fundamentals",
            duration: "45 minutes"
          }))
        }
      };

      // Handle the possibility of incomplete data from the edge function
      let practicePlan: GeneratedPracticePlan;
      
      if (data && data.diagnosis && data.rootCauses && data.practicePlan?.plan) {
        practicePlan = {
          problem: issue || "Golf performance optimization",
          diagnosis: data.diagnosis,
          rootCauses: data.rootCauses,
          recommendedDrills: drills || [],
          practicePlan: {
            duration: `${planDuration} ${parseInt(planDuration) > 1 ? 'days' : 'day'}`,
            frequency: "Daily",
            plan: data.practicePlan.plan
          }
        };
      } else {
        console.warn('Received incomplete data from edge function, using default plan');
        practicePlan = defaultPlan;
      }

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
