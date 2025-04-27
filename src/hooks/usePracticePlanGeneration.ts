
import { useState, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { HandicapLevel } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { Drill } from "@/types/drill";
import { useAPIUsageCheck } from "@/hooks/useAPIUsageCheck";

export const usePracticePlanGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const { checkAPIUsage } = useAPIUsageCheck();

  /**
   * Categories a golf problem into a general skill area
   */
  const categorizeGolfProblem = useCallback((issue: string): string => {
    const lowerIssue = issue.toLowerCase();
    
    // Ball striking issues
    if (lowerIssue.includes('chunk') || 
        lowerIssue.includes('fat') ||
        lowerIssue.includes('thin') || 
        lowerIssue.includes('top') ||
        lowerIssue.includes('contact') || 
        lowerIssue.includes('ball striking') ||
        lowerIssue.includes('compress')) {
      return 'ball_striking';
    }
    
    // Driving and accuracy issues
    if (lowerIssue.includes('slice') || 
        lowerIssue.includes('hook') || 
        lowerIssue.includes('driver') || 
        lowerIssue.includes('off the tee') ||
        lowerIssue.includes('tee shot') ||
        lowerIssue.includes('direction')) {
      return 'driving_accuracy';
    }
    
    // Short game issues
    if (lowerIssue.includes('chip') || 
        lowerIssue.includes('pitch') || 
        lowerIssue.includes('bunker') || 
        lowerIssue.includes('sand') ||
        lowerIssue.includes('short game')) {
      return 'short_game';
    }
    
    // Putting issues
    if (lowerIssue.includes('putt') || 
        lowerIssue.includes('green') || 
        lowerIssue.includes('read') ||
        lowerIssue.includes('lag')) {
      return 'putting';
    }
    
    return 'general';
  }, []);

  /**
   * Finds the most relevant drills for a specific problem
   */
  const findRelevantDrills = useCallback(async (issue: string): Promise<Drill[]> => {
    if (!issue) return [];
    
    try {
      // Categorize the issue for better search
      const problemCategory = categorizeGolfProblem(issue);
      console.log(`Issue "${issue}" categorized as: ${problemCategory}`);
      
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

      if (!drills || drills.length === 0) {
        console.error('No drills found in database');
        return [];
      }
      
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
        
        // Category-based matching for better results
        switch(problemCategory) {
          case 'ball_striking':
            if (drillText.includes('iron') || 
                drillText.includes('contact') || 
                drillText.includes('strike') ||
                drillText.includes('compress') ||
                drillText.includes('impact')) {
              return true;
            }
            break;
          
          case 'driving_accuracy':
            if (drillText.includes('driver') || 
                drillText.includes('slice') || 
                drillText.includes('hook') ||
                drillText.includes('path') ||
                drillText.includes('alignment')) {
              return true;
            }
            break;
            
          case 'short_game':
            if (drillText.includes('chip') || 
                drillText.includes('pitch') ||
                drillText.includes('short game') ||
                drillText.includes('bunker') ||
                drillText.includes('sand')) {
              return true;
            }
            break;
            
          case 'putting':
            if (drillText.includes('putt') || 
                drillText.includes('green') ||
                drillText.includes('read') ||
                drillText.includes('stroke')) {
              return true;
            }
            break;
        }
        
        // Match if any search term is found in the drill text
        return searchTerms.some(term => drillText.includes(term));
      });
    } catch (error) {
      console.error('Error finding relevant drills:', error);
      return [];
    }
  }, [categorizeGolfProblem]);

  const generatePlan = useCallback(async (
    userId: string | undefined,
    issue: string, 
    handicapLevel?: HandicapLevel, 
    planDuration: string = "1"
  ): Promise<GeneratedPracticePlan> => {
    const canProceed = await checkAPIUsage(userId, 'practice_plan');
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

      // Determine if this is an AI-generated plan (no specific issue) or user-specified problem
      const isAIGenerated = !issue || issue === "Improve overall golf performance";

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

      let practicePlan: GeneratedPracticePlan;
      
      if (data && data.diagnosis && data.rootCauses && data.practicePlan?.plan) {
        // Extract additional data if available
        const userGoals = data.userGoals || {};
        const performanceInsights = data.performanceInsights || [];
        
        practicePlan = {
          problem: issue || "Golf performance optimization",
          diagnosis: data.diagnosis,
          rootCauses: data.rootCauses,
          recommendedDrills: relevantDrills,
          practicePlan: {
            duration: `${planDuration} ${parseInt(planDuration) > 1 ? 'days' : 'day'}`,
            frequency: "Daily",
            plan: data.practicePlan.plan,
            challenge: data.practicePlan.challenge
          },
          performanceInsights: performanceInsights,
          userGoals: userGoals,
          isAIGenerated: data.isAIGenerated || isAIGenerated
        };

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
      } else {
        console.warn('Received incomplete data from edge function');
        throw new Error('Failed to generate practice plan');
      }
    } catch (error) {
      console.error("Error generating practice plan:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [checkAPIUsage, findRelevantDrills, toast]);

  return { generatePlan, isGenerating };
};
