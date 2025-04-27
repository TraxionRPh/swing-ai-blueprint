
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { HandicapLevel } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { Drill } from "@/types/drill";

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

  /**
   * Finds the most relevant drills for a specific problem
   */
  const findRelevantDrills = async (issue: string): Promise<Drill[]> => {
    if (!issue) return [];
    
    try {
      const searchTerms = issue
        .toLowerCase()
        .split(/[\s-]+/)
        .filter(term => term.length > 2);
      
      // Fetch all drills
      const { data: drills, error: drillsError } = await supabase
        .from('drills')
        .select('*');

      if (drillsError) {
        console.error('Error fetching drills:', drillsError);
        return [];
      }

      if (!drills || drills.length === 0) return [];
      
      // Enhanced matching logic
      return drills.filter(drill => {
        // Skip drills with no focus or missing data
        if (!drill.focus || !Array.isArray(drill.focus) || !drill.title) return false;
        
        // Create a combined text representation of the drill
        const drillText = [
          drill.title.toLowerCase(),
          drill.overview?.toLowerCase() || '',
          drill.category?.toLowerCase() || '',
          ...drill.focus.map(f => f.toLowerCase())
        ].join(' ');
        
        // Match if any search term is found in the drill text
        return searchTerms.some(term => drillText.includes(term));
      });
    } catch (error) {
      console.error('Error finding relevant drills:', error);
      return [];
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
      // Find relevant drills for the specific issue
      const relevantDrills = await findRelevantDrills(issue);
      console.log('Found relevant drills:', relevantDrills.length);
      
      // Fetch recent round data for better context
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
          availableDrills: relevantDrills
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Received response from edge function:', data);

      let practicePlan: GeneratedPracticePlan;
      
      if (data && data.diagnosis && data.rootCauses && data.practicePlan?.plan) {
        practicePlan = {
          problem: issue || "Golf performance optimization",
          diagnosis: data.diagnosis,
          rootCauses: data.rootCauses,
          recommendedDrills: relevantDrills,
          practicePlan: {
            duration: `${planDuration} ${parseInt(planDuration) > 1 ? 'days' : 'day'}`,
            frequency: "Daily",
            plan: data.practicePlan.plan
          }
        };
      } else {
        console.warn('Received incomplete data from edge function');
        throw new Error('Failed to generate practice plan');
      }

      if (userId) {
        const { error: saveError } = await supabase
          .from('ai_practice_plans')
          .insert({
            user_id: userId,
            problem: issue || 'General golf improvement',
            diagnosis: practicePlan.diagnosis,
            root_causes: practicePlan.rootCauses as unknown as Json,
            recommended_drills: practicePlan.recommendedDrills as unknown as Json,
            practice_plan: practicePlan as unknown as Json
          });

        if (saveError) throw saveError;
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
