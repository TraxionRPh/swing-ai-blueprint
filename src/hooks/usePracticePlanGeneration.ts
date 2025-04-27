
import { useState, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GeneratedPracticePlan, DrillWithSets } from "@/types/practice-plan";
import { HandicapLevel } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { Drill } from "@/types/drill";
import { useAPIUsageCheck } from "@/hooks/useAPIUsageCheck";

// Types for internal use
interface DrillCategory {
  category: string;
  keywords: string[];
  relatedClubs: string[];
}

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
   * Fetches drills from database and filters by relevance
   */
  const findRelevantDrills = useCallback(async (issue: string): Promise<Drill[]> => {
    if (!issue) return [];
    
    try {
      // Categorize the issue for better search
      const problemCategory = categorizeGolfProblem(issue);
      console.log(`Issue "${issue}" categorized as: ${problemCategory}`);
      
      const searchTerms = extractSearchTerms(issue);
      
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
      
      console.log(`Found ${drills.length} drills in database`);
      
      // Enhanced matching logic with scoring
      return rankDrillsByRelevance(drills as Drill[], searchTerms, problemCategory, issue);
    } catch (error) {
      console.error('Error finding relevant drills:', error);
      return [];
    }
  }, [categorizeGolfProblem]);

  /**
   * Extract meaningful search terms from an issue description
   */
  const extractSearchTerms = (issue: string): string[] => {
    return issue
      .toLowerCase()
      .split(/[\s-]+/)
      .filter(term => term.length > 2 && !['the', 'and', 'for', 'with'].includes(term));
  };

  /**
   * Score and rank drills based on their relevance to the issue
   */
  const rankDrillsByRelevance = (
    drills: Drill[], 
    searchTerms: string[], 
    problemCategory: string,
    issue: string
  ): Drill[] => {
    // Skip drills with missing essential data
    const validDrills = drills.filter(drill => (
      drill && drill.title && (drill.focus || drill.category)
    ));
    
    if (validDrills.length === 0) {
      console.warn('No valid drills found to rank');
      return [];
    }

    // Score each drill based on relevance
    const scoredDrills = validDrills.map(drill => {
      // Create a combined text representation of the drill
      const drillText = [
        drill.title.toLowerCase(),
        drill.overview?.toLowerCase() || '',
        drill.category?.toLowerCase() || '',
        ...(Array.isArray(drill.focus) ? drill.focus.map(f => f.toLowerCase()) : [])
      ].join(' ');
      
      let score = 0;
      
      // Category-based matching
      if (matchesCategoryKeywords(drillText, problemCategory)) {
        score += 0.5;
      }
      
      // Direct term matching
      const termMatches = searchTerms.filter(term => drillText.includes(term));
      score += (termMatches.length / searchTerms.length) * 0.3;
      
      // Skill-specific bonus
      score += calculateSkillSpecificBonus(drillText, issue);
      
      return { ...drill, relevanceScore: score };
    });
    
    // Sort by relevance score (descending) and return top matches
    return scoredDrills
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 10);
  };

  /**
   * Check if a drill matches keywords for a problem category
   */
  const matchesCategoryKeywords = (drillText: string, category: string): boolean => {
    const categoryKeywords: Record<string, string[]> = {
      'ball_striking': [
        'strike', 'contact', 'compress', 'impact', 'iron', 'ball first', 'divot'
      ],
      'driving_accuracy': [
        'driver', 'tee', 'slice', 'hook', 'path', 'face', 'alignment'
      ],
      'short_game': [
        'chip', 'pitch', 'bunker', 'sand', 'lob', 'around the green', 'wedge'
      ],
      'putting': [
        'putt', 'green', 'roll', 'stroke', 'read', 'line', 'speed'
      ],
      'general': [
        'practice', 'drill', 'fundamental', 'routine', 'setup'
      ]
    };
    
    const keywords = categoryKeywords[category] || categoryKeywords.general;
    return keywords.some(keyword => drillText.includes(keyword));
  };

  /**
   * Calculate additional relevance score based on specific skill issues
   */
  const calculateSkillSpecificBonus = (drillText: string, issue: string): number => {
    const lowerIssue = issue.toLowerCase();
    let bonus = 0;
    
    if (lowerIssue.includes('slice') && 
        (drillText.includes('path') || drillText.includes('face') || drillText.includes('slice'))) {
      bonus += 0.2;
    }
    
    if (lowerIssue.includes('putt') && drillText.includes('putt')) {
      bonus += 0.2;
    }
    
    if (lowerIssue.includes('sand') && drillText.includes('bunker')) {
      bonus += 0.2;
    }
    
    return bonus;
  };

  /**
   * Creates a new practice plan based on the user's issue and preferences
   */
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
      
      if (relevantDrills.length === 0) {
        console.warn('No relevant drills found for the issue:', issue);
      }
      
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
        
        // Log incoming plan data for debugging
        console.log('Raw plan data from edge function:', {
          planDays: data.practicePlan.plan.length,
          drillReferences: data.practicePlan.plan.map(day => ({
            day: day.day,
            drillCount: day.drills?.length || 0,
            drillTypes: day.drills?.map(d => typeof d.drill)
          }))
        });
        
        // Create the practice plan
        practicePlan = {
          problem: issue || "Golf performance optimization",
          diagnosis: data.diagnosis,
          rootCauses: data.rootCauses,
          recommendedDrills: relevantDrills,
          practicePlan: {
            duration: `${planDuration} ${parseInt(planDuration) > 1 ? 'days' : 'day'}`,
            frequency: "Daily",
            plan: processAndValidatePlanDays(data.practicePlan.plan, relevantDrills),
            challenge: data.practicePlan.challenge
          },
          performanceInsights: performanceInsights,
          userGoals: userGoals,
          isAIGenerated: data.isAIGenerated || isAIGenerated
        };

        // Save to database if user is logged in
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
  }, [checkAPIUsage, findRelevantDrills]);

  /**
   * Process and validate plan days, ensuring all drill references are valid objects
   */
  const processAndValidatePlanDays = (planDays: any[], availableDrills: Drill[]) => {
    if (!Array.isArray(planDays)) {
      console.error('Plan days is not an array:', planDays);
      return [];
    }
    
    return planDays.map(day => {
      // Ensure day has a valid drills array
      if (!day.drills || !Array.isArray(day.drills)) {
        console.warn(`Day ${day.day} has no valid drills array`);
        day.drills = [];
        return day;
      }
      
      // Process each drill in the day
      day.drills = day.drills.map((drillWithSets: any): DrillWithSets => {
        // Set defaults if missing
        const sets = drillWithSets.sets || 3;
        const reps = drillWithSets.reps || 10;
        let drillObject: Drill | undefined;
        
        // Check if we need to look up the drill
        if (typeof drillWithSets.drill === 'string') {
          const drillId = drillWithSets.drill;
          drillObject = availableDrills.find(d => d.id === drillId);
          
          if (!drillObject) {
            console.warn(`Could not find drill with ID ${drillId}`);
            return null; // This entry will be filtered out
          }
        } else if (typeof drillWithSets.drill === 'object' && drillWithSets.drill !== null) {
          drillObject = drillWithSets.drill as Drill;
        } else {
          console.warn('Invalid drill reference:', drillWithSets.drill);
          return null; // This entry will be filtered out
        }
        
        // Create the processed drill with sets object
        return {
          drill: drillObject,
          sets,
          reps,
          id: drillObject.id // Ensure ID is set for lookup stability
        };
      }).filter(Boolean); // Remove null entries
      
      return day;
    });
  };

  return { generatePlan, isGenerating };
};
