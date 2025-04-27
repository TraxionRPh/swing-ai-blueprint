import { useState, useMemo, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GeneratedPracticePlan, DrillWithSets } from "@/types/practice-plan";
import { HandicapLevel } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import { Drill } from "@/types/drill";
import { useAPIUsageCheck } from "@/hooks/useAPIUsageCheck";

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
    
    if (lowerIssue.includes('chunk') || 
        lowerIssue.includes('fat') ||
        lowerIssue.includes('thin') || 
        lowerIssue.includes('top') ||
        lowerIssue.includes('contact') || 
        lowerIssue.includes('ball striking') ||
        lowerIssue.includes('compress')) {
      return 'ball_striking';
    }
    
    if (lowerIssue.includes('slice') || 
        lowerIssue.includes('hook') || 
        lowerIssue.includes('driver') || 
        lowerIssue.includes('off the tee') ||
        lowerIssue.includes('tee shot') ||
        lowerIssue.includes('direction')) {
      return 'driving_accuracy';
    }
    
    if (lowerIssue.includes('chip') || 
        lowerIssue.includes('pitch') || 
        lowerIssue.includes('bunker') || 
        lowerIssue.includes('sand') ||
        lowerIssue.includes('short game')) {
      return 'short_game';
    }
    
    if (lowerIssue.includes('putt') || 
        lowerIssue.includes('green') || 
        lowerIssue.includes('read') ||
        lowerIssue.includes('lag')) {
      return 'putting';
    }
    
    return 'general';
  }, []);

  /**
   * Find relevant drills for a specific issue
   */
  const findRelevantDrills = useCallback(async (issue: string): Promise<Drill[]> => {
    if (!issue) return [];
    
    try {
      const problemCategory = categorizeGolfProblem(issue);
      console.log(`Issue "${issue}" categorized as: ${problemCategory}`);
      
      const searchTerms = extractSearchTerms(issue);
      
      const { data: drills, error: drillsError } = await supabase
        .from('drills')
        .select('*');

      if (drillsError) {
        console.error('Error fetching drills:', drillsError);
        return [];
      }

      if (!drills || drills.length === 0) {
        console.error('No drills found in database');
        toast({
          title: "Limited Drill Selection",
          description: "Few specific drills were found for this problem. Using general golf improvement drills instead.",
          variant: "default"
        });
        return [];
      }
      
      console.log(`Found ${drills.length} drills in database`);
      
      return rankDrillsByRelevance(drills as Drill[], searchTerms, problemCategory, issue);
    } catch (error) {
      console.error('Error finding relevant drills:', error);
      return [];
    }
  }, [categorizeGolfProblem, toast]);

  /**
   * Extract meaningful search terms from an issue description
   */
  const extractSearchTerms = (issue: string): string[] => {
    return issue
      .toLowerCase()
      .split(/[\s-]+/)
      .filter(term => term.length > 2 && !['the', 'and', 'for', 'with', 'ball'].includes(term));
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
    console.log(`Ranking ${drills.length} drills for relevance to "${issue}"`);
    console.log(`Search terms: ${searchTerms.join(', ')}`);
    
    const validDrills = drills.filter(drill => (
      drill && drill.title && (drill.focus || drill.category)
    ));
    
    if (validDrills.length === 0) {
      console.warn('No valid drills found to rank');
      return [];
    }
    
    console.log(`Found ${validDrills.length} valid drills for ranking`);

    const scoredDrills = validDrills.map(drill => {
      const drillText = [
        drill.title.toLowerCase(),
        drill.overview?.toLowerCase() || '',
        drill.category?.toLowerCase() || '',
        ...(Array.isArray(drill.focus) ? drill.focus.map(f => f.toLowerCase()) : [])
      ].join(' ');
      
      let score = 0;
      
      if (matchesCategoryKeywords(drillText, problemCategory)) {
        score += 0.5;
        console.log(`Drill "${drill.title}" matched category keywords: +0.5 points`);
      }
      
      const termMatches = searchTerms.filter(term => drillText.includes(term));
      const termMatchScore = (termMatches.length / searchTerms.length) * 0.3;
      score += termMatchScore;
      if (termMatches.length > 0) {
        console.log(`Drill "${drill.title}" matched terms [${termMatches.join(', ')}]: +${termMatchScore.toFixed(2)} points`);
      }
      
      const skillBonus = calculateSkillSpecificBonus(drillText, issue);
      score += skillBonus;
      if (skillBonus > 0) {
        console.log(`Drill "${drill.title}" got skill bonus: +${skillBonus.toFixed(2)} points`);
      }
      
      if (issue.toLowerCase().includes('topping') && 
         (drillText.includes('top') || 
          drillText.includes('thin') || 
          drillText.includes('ball position') || 
          drillText.includes('strike'))) {
        score += 0.5;
        console.log(`Drill "${drill.title}" got topping boost: +0.5 points`);
      }
      
      console.log(`Drill "${drill.title}" final score: ${score.toFixed(2)}`);
      
      return { ...drill, relevanceScore: score };
    });
    
    const result = scoredDrills
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 10);
      
    console.log(`Top ranked drills: ${result.map(d => d.title).join(', ')}`);
    
    return result;
  };

  /**
   * Check if a drill matches keywords for a problem category
   */
  const matchesCategoryKeywords = (drillText: string, category: string): boolean => {
    const categoryKeywords: Record<string, string[]> = {
      'ball_striking': [
        'strike', 'contact', 'compress', 'impact', 'iron', 'ball first', 'divot', 
        'top', 'thin', 'fat', 'chunk'
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
    
    if (lowerIssue.includes('topping') || lowerIssue.includes('thin') || lowerIssue.includes('top')) {
      if (drillText.includes('weight') || 
          drillText.includes('posture') || 
          drillText.includes('position') || 
          drillText.includes('contact')) {
        bonus += 0.3;
      }
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
      const relevantDrills = await findRelevantDrills(issue);
      console.log('Found relevant drills:', relevantDrills.length);
      
      if (relevantDrills.length < 2) {
        const { data: fundamentalDrills } = await supabase
          .from('drills')
          .select('*')
          .or('title.ilike.%fundamental%,title.ilike.%basic%')
          .limit(3);
        
        if (fundamentalDrills) {
          relevantDrills.push(...fundamentalDrills);
        }
        
        if (relevantDrills.length === 0) {
          toast({
            title: "Limited Drill Selection",
            description: "Few specific drills were found for this problem. Using general golf improvement drills instead.",
            variant: "default"
          });
        }
      }

      const { data: roundData } = await supabase
        .from('rounds')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
        
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*');
        
      if (challengesError) {
        console.error('Error fetching challenges:', challengesError);
      } else {
        console.log(`Found ${challengesData?.length || 0} challenges in database`);
      }

      const isAIGenerated = !issue || issue === "Improve overall golf performance";

      const { data, error } = await supabase.functions.invoke('analyze-golf-performance', {
        body: { 
          userId, 
          roundData: roundData || [],
          handicapLevel: handicapLevel || 'intermediate',
          specificProblem: issue || 'Improve overall golf performance',
          planDuration,
          availableDrills: relevantDrills,
          availableChallenges: challengesData || []
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      let practicePlan: GeneratedPracticePlan;
      
      if (data && data.diagnosis && data.rootCauses && data.practicePlan?.plan) {
        const userGoals = data.userGoals || {};
        const performanceInsights = data.performanceInsights || [];
        
        console.log('Raw plan data from edge function:', {
          planDays: data.practicePlan.plan.length,
          drillReferences: data.practicePlan.plan.map((day: any) => ({
            day: day.day,
            drillCount: day.drills?.length || 0,
            drillTypes: day.drills?.map((d: any) => typeof d.drill)
          }))
        });
        
        const challenge = data.practicePlan.challenge || createChallengeForProblem(issue);
        
        let diagnosis = data.diagnosis;
        let rootCauses = data.rootCauses;
        
        if (issue.toLowerCase().includes('topping') && 
            !diagnosis.toLowerCase().includes('topping')) {
          diagnosis = createToppingDiagnosis(handicapLevel);
          rootCauses = createToppingRootCauses();
        }
        
        practicePlan = {
          problem: issue || "Golf performance optimization",
          diagnosis: diagnosis,
          rootCauses: rootCauses,
          recommendedDrills: relevantDrills,
          practicePlan: {
            duration: `${planDuration} ${parseInt(planDuration) > 1 ? 'days' : 'day'}`,
            frequency: "Daily",
            plan: processAndValidatePlanDays(data.practicePlan.plan, relevantDrills),
            challenge: challenge
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

  /**
   * Process and validate plan days, ensuring all drill references are valid objects
   */
  const processAndValidatePlanDays = (planDays: any[], availableDrills: Drill[]) => {
    if (!Array.isArray(planDays)) {
      console.error('Plan days is not an array:', planDays);
      return [];
    }
    
    return planDays.map(day => {
      if (!day.drills || !Array.isArray(day.drills)) {
        console.warn(`Day ${day.day} has no valid drills array`);
        day.drills = [];
        return day;
      }
      
      const processedDrills = day.drills
        .map((drillWithSets: any) => {
          if (!drillWithSets || !drillWithSets.drill) {
            console.warn('Invalid drill entry in day plan:', drillWithSets);
            return null;
          }

          const sets = drillWithSets.sets || 3;
          const reps = drillWithSets.reps || 10;
          
          if (typeof drillWithSets.drill === 'string') {
            const drillId = drillWithSets.drill;
            console.log(`Looking for drill with ID: ${drillId}`);
            
            const drillObject = availableDrills.find(d => d.id === drillId);
            
            if (drillObject) {
              console.log(`Successfully found drill: ${drillObject.title}`);
              return {
                drill: drillObject,
                sets,
                reps,
                id: drillObject.id
              };
            } else {
              console.warn(`Could not find drill with ID ${drillId}, trying to find a fallback drill`);
              
              if (availableDrills.length > 0) {
                const fallbackDrill = availableDrills[0];
                console.log(`Using fallback drill: ${fallbackDrill.title}`);
                return {
                  drill: fallbackDrill,
                  sets,
                  reps,
                  id: fallbackDrill.id
                };
              }
              
              console.error('No fallback drill available, skipping this drill');
              return null;
            }
          } else if (typeof drillWithSets.drill === 'object' && drillWithSets.drill !== null) {
            const drillObject = drillWithSets.drill as Drill;
            console.log(`Using drill object directly: ${drillObject.title}`);
            return {
              drill: drillObject,
              sets,
              reps,
              id: drillObject.id || drillWithSets.id
            };
          } else {
            console.warn('Invalid drill reference:', drillWithSets.drill);
            return null;
          }
        })
        .filter(Boolean);
      
      console.log(`Day ${day.day} - Processed ${processedDrills.length} drills successfully`);
      
      if (processedDrills.length === 0 && availableDrills.length > 0) {
        const fallbackDrill = availableDrills[0];
        console.log(`Adding fallback drill to empty day ${day.day}: ${fallbackDrill.title}`);
        processedDrills.push({
          drill: fallbackDrill,
          sets: 3,
          reps: 10,
          id: fallbackDrill.id
        });
      }
      
      return {
        ...day,
        drills: processedDrills
      };
    });
  };

  /**
   * Create a specific diagnosis for topping the ball
   */
  const createToppingDiagnosis = (handicapLevel?: HandicapLevel): string => {
    const skillLevel = handicapLevel || 'intermediate';
    
    let intro = '';
    switch (skillLevel) {
      case 'beginner':
        intro = "As a beginner golfer, topping the ball is a common issue. ";
        break;
      case 'novice':
        intro = "As a novice golfer developing your skills, topping the ball is a challenge you need to address. ";
        break;
      case 'intermediate':
        intro = "As an intermediate golfer, topping the ball is holding back your progress. ";
        break;
      case 'advanced':
        intro = "Even as an advanced golfer, occasional topped shots can creep into your game. ";
        break;
      default:
        intro = "Topping the golf ball is a common issue that affects golfers of all levels. ";
    }
    
    return intro + "Topping occurs when the clubhead strikes the upper half of the ball, causing it to travel along the ground with little loft. This is typically caused by rising up during the downswing, improper weight transfer, or poor ball positioning in your stance. Your practice plan focuses on maintaining your spine angle, proper weight shift, and consistent ball position to promote clean ball-first contact.";
  };

  /**
   * Create specific root causes for topping the ball issue
   */
  const createToppingRootCauses = (): string[] => {
    return [
      "Rising up during the downswing causing the club to strike the top of the ball",
      "Insufficient weight transfer to the lead foot through impact",
      "Poor ball position in your stance (too far forward or back)",
      "Lifting your head or eyes before impact",
      "Inconsistent posture throughout the swing"
    ];
  };

  /**
   * Create a specific challenge for a particular golf problem
   */
  const createChallengeForProblem = (problem: string) => {
    const lowerProblem = problem.toLowerCase();
    
    const challenge = {
      id: "custom-challenge",
      title: "Golf Skill Challenge",
      description: "Test your improvement with this personalized challenge",
      difficulty: "Medium",
      category: "General", 
      metrics: ["Accuracy"],
      metric: "Accuracy",
      instruction1: "Complete the recommended practice drills",
      instruction2: "Apply the techniques in a controlled environment",
      instruction3: "Measure your improvement",
      attempts: 10
    };
    
    if (lowerProblem.includes('topping') || lowerProblem.includes('thin') || lowerProblem.includes('top')) {
      challenge.title = "Clean Contact Challenge";
      challenge.description = "Test your ability to make clean contact with the ball";
      challenge.category = "Ball Striking";
      challenge.instruction1 = "Hit 10 balls focusing on maintaining your posture and weight transfer";
      challenge.instruction2 = "Count how many shots have clean ball-first contact";
      challenge.instruction3 = "Calculate your clean contact percentage";
    } else if (lowerProblem.includes('slice')) {
      challenge.title = "Slice Correction Challenge";
      challenge.description = "Test your ability to reduce slice and hit straighter shots";
      challenge.category = "Driving";
      challenge.instruction1 = "Hit 10 drives focusing on your corrected swing path";
      challenge.instruction2 = "Count how many shots fly straight without a slice";
      challenge.instruction3 = "Calculate your straight shot percentage";
    } else if (lowerProblem.includes('putt')) {
      challenge.title = "Putting Accuracy Challenge";
      challenge.description = "Test your putting accuracy and consistency";
      challenge.category = "Putting";
      challenge.metrics = ["Putts Made"];
      challenge.metric = "Putts Made";
      challenge.instruction1 = "Set up 10 putts at 6 feet distance";
      challenge.instruction2 = "Count how many you make successfully";
      challenge.instruction3 = "Calculate your make percentage";
    }
    
    return challenge;
  };

  return { generatePlan, isGenerating };
};
