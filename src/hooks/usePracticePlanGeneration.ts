
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
      
      // Special handling for putting issues
      if (issue.toLowerCase().includes('putt')) {
        const puttingDrills = drills.filter((drill: Drill) => {
          if (!drill) return false;
          
          const drillText = [
            drill.title?.toLowerCase() || '',
            drill.overview?.toLowerCase() || '',
            drill.category?.toLowerCase() || '',
            ...(Array.isArray(drill.focus) ? drill.focus.map(f => f.toLowerCase()) : [])
          ].join(' ');
          
          return drillText.includes('putt') || 
                 drillText.includes('green') || 
                 drillText.includes('hole') || 
                 drillText.includes('cup') ||
                 (drill.category?.toLowerCase() === 'putting');
        });
        
        console.log(`Found ${puttingDrills.length} putting-specific drills`);
        
        // If we found putting drills, prioritize them
        if (puttingDrills.length >= 4) {
          return rankDrillsByRelevance(puttingDrills as Drill[], searchTerms, problemCategory, issue);
        }
      }
      
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
      
      // Special handling for putting drills in putting-related issues
      if (issue.toLowerCase().includes('putt') && 
         (drillText.includes('putt') || 
          drillText.includes('green') || 
          drillText.includes('stroke') ||
          drill.category?.toLowerCase() === 'putting')) {
        score += 0.7;
        console.log(`Drill "${drill.title}" got putting boost: +0.7 points`);
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
      bonus += 0.4;
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
      
      // Make sure we have enough drills for variety (at least 6)
      if (relevantDrills.length < 6) {
        // First, try to get more category-specific drills
        let categoryQuery = '';
        
        if (issue.toLowerCase().includes('putt')) {
          categoryQuery = "category.ilike.%putting%";
        } else if (issue.toLowerCase().includes('chip') || issue.toLowerCase().includes('short')) {
          categoryQuery = "category.ilike.%short game%";
        } else if (issue.toLowerCase().includes('driv') || issue.toLowerCase().includes('tee')) {
          categoryQuery = "category.ilike.%driving%";
        } else {
          categoryQuery = "category.ilike.%fundamental%";
        }
        
        const { data: categoryDrills } = await supabase
          .from('drills')
          .select('*')
          .or(categoryQuery)
          .limit(5);
        
        if (categoryDrills) {
          console.log(`Found ${categoryDrills.length} additional category drills`);
          
          // Add drills we don't already have
          const existingIds = new Set(relevantDrills.map(d => d.id));
          const newCategoryDrills = categoryDrills.filter(d => !existingIds.has(d.id));
          
          relevantDrills.push(...newCategoryDrills);
        }
        
        // If we still need more, add fundamental drills
        if (relevantDrills.length < 6) {
          const { data: fundamentalDrills } = await supabase
            .from('drills')
            .select('*')
            .or('title.ilike.%fundamental%,title.ilike.%basic%')
            .limit(6 - relevantDrills.length);
          
          if (fundamentalDrills) {
            // Add drills we don't already have
            const existingIds = new Set(relevantDrills.map(d => d.id));
            const newFundamentalDrills = fundamentalDrills.filter(d => !existingIds.has(d.id));
            
            relevantDrills.push(...newFundamentalDrills);
          }
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
        
        // Process plan days to ensure unique drill sets
        const processedDays = processAndDiversifyPlanDays(data.practicePlan.plan, relevantDrills);
        
        practicePlan = {
          problem: issue || "Golf performance optimization",
          diagnosis: diagnosis,
          rootCauses: rootCauses,
          recommendedDrills: relevantDrills,
          practicePlan: {
            duration: `${planDuration} ${parseInt(planDuration) > 1 ? 'days' : 'day'}`,
            frequency: "Daily",
            plan: processedDays,
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
   * AND that each day has a unique set of drills
   */
  const processAndDiversifyPlanDays = (planDays: any[], availableDrills: Drill[]) => {
    if (!Array.isArray(planDays)) {
      console.error('Plan days is not an array:', planDays);
      return [];
    }
    
    console.log(`Processing ${planDays.length} plan days with ${availableDrills.length} available drills`);
    
    // Track used drills for each day to ensure variety
    const usedDrillSets: Record<number, Set<string>> = {};
    
    // Create a shuffled copy of all available drills to use for variety
    const shuffledDrills = [...availableDrills].sort(() => Math.random() - 0.5);
    
    return planDays.map((day, dayIndex) => {
      if (!day.drills || !Array.isArray(day.drills)) {
        console.warn(`Day ${day.day} has no valid drills array`);
        day.drills = [];
      }
      
      // Create a set to track used drill IDs for this day
      usedDrillSets[dayIndex] = new Set<string>();
      
      // Check if this day uses the same drills as a previous day
      let isDuplicateOfPreviousDay = false;
      if (dayIndex > 0) {
        const previousDayDrills = planDays[dayIndex-1]?.drills?.map((d: any) => 
          typeof d.drill === 'string' ? d.drill : d.drill?.id
        ).sort().join(',');
        
        const currentDayDrills = day.drills?.map((d: any) => 
          typeof d.drill === 'string' ? d.drill : d.drill?.id
        ).sort().join(',');
        
        if (previousDayDrills && currentDayDrills && previousDayDrills === currentDayDrills) {
          isDuplicateOfPreviousDay = true;
          console.log(`Day ${day.day} has identical drill set to previous day, will diversify`);
        }
      }
      
      // Process existing drills first
      const processedDrills = (day.drills || [])
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
              
              // Add to used drills for this day
              usedDrillSets[dayIndex].add(drillId);
              
              return {
                drill: drillObject,
                sets,
                reps,
                id: drillObject.id
              };
            } else {
              console.warn(`Could not find drill with ID ${drillId}, will find alternative`);
              return null;
            }
          } else if (typeof drillWithSets.drill === 'object' && drillWithSets.drill !== null) {
            const drillObject = drillWithSets.drill as Drill;
            console.log(`Using drill object directly: ${drillObject.title}`);
            
            // Add to used drills for this day
            if (drillObject.id) usedDrillSets[dayIndex].add(drillObject.id);
            
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
      
      // If we have duplicate drills from previous day or not enough drills, diversify
      if (isDuplicateOfPreviousDay || processedDrills.length < 2) {
        console.log(`Diversifying drills for day ${day.day}`);
        
        // How many drills we need to add
        const targetDrillCount = Math.max(3, processedDrills.length + 1);
        const drillsToAdd = targetDrillCount - processedDrills.length;
        
        // Get unique drills not used on this day and preferably not used on previous day
        const previousDayDrillIds = dayIndex > 0 ? 
          Array.from(usedDrillSets[dayIndex-1] || []) : [];
        
        const currentDayDrillIds = Array.from(usedDrillSets[dayIndex] || []);
        
        // Find drills not used in current day
        const availableForThisDay = shuffledDrills
          .filter(drill => drill.id && !currentDayDrillIds.includes(drill.id))
          // Give preference to drills not used in previous day
          .sort((a, b) => {
            const aUsedInPrevDay = a.id && previousDayDrillIds.includes(a.id) ? 1 : 0;
            const bUsedInPrevDay = b.id && previousDayDrillIds.includes(b.id) ? 1 : 0;
            return aUsedInPrevDay - bUsedInPrevDay;
          });
          
        // Add new diverse drills
        for (let i = 0; i < drillsToAdd && i < availableForThisDay.length; i++) {
          const newDrill = availableForThisDay[i];
          if (!newDrill) continue;
          
          console.log(`Adding diverse drill to day ${day.day}: ${newDrill.title}`);
          
          // Add to processed drills
          processedDrills.push({
            drill: newDrill,
            sets: 3,
            reps: 10,
            id: newDrill.id
          });
          
          // Mark as used
          if (newDrill.id) usedDrillSets[dayIndex].add(newDrill.id);
        }
      }
      
      // Final check to ensure minimum drill count
      if (processedDrills.length < 2) {
        // We couldn't get enough unique drills, so use whatever we have available
        for (let i = 0; i < 2 && i < shuffledDrills.length; i++) {
          const backupDrill = shuffledDrills[i];
          
          console.log(`Adding backup drill to day ${day.day}: ${backupDrill.title}`);
          
          processedDrills.push({
            drill: backupDrill,
            sets: 3,
            reps: 10,
            id: backupDrill.id
          });
        }
      }
      
      console.log(`Day ${day.day} - Final drill count: ${processedDrills.length}`);
      
      // Return the updated day with diverse drills
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
    } else if (lowerProblem.includes('bunker') || lowerProblem.includes('sand')) {
      challenge.title = "Bunker Escape Challenge";
      challenge.description = "Test your ability to escape bunkers efficiently";
      challenge.category = "Bunker Play";
      challenge.metrics = ["Successful Escapes"];
      challenge.metric = "Successful Escapes";
      challenge.instruction1 = "Hit 10 bunker shots from a greenside bunker";
      challenge.instruction2 = "Count how many successfully exit the bunker in one shot and land on the green";
      challenge.instruction3 = "Calculate your percentage of successful bunker escapes";
      challenge.attempts = 10;
    }
    
    return challenge;
  };

  return { generatePlan, isGenerating };
};

