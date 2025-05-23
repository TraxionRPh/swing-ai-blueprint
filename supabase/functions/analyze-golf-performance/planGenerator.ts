import { DrillData, PlanDay, AIResponse } from './types.ts';
import { getDrillRelevanceScore, isPuttingRelated } from './drillMatching.ts';
import { identifyProblemCategory, extractRelevantSearchTerms } from './golfCategorization.ts';
import { DiagnosisGenerator } from './DiagnosisGenerator.ts';
import { PracticeDayGenerator } from './PracticeDayGenerator.ts';
import { ChallengeSelector } from './ChallengeSelector.ts';

interface UserData {
  userData: {
    handicap_level?: string;
    selected_goals?: string[];
    score_goal?: number;
    handicap_goal?: number;
  };
  challengeResults?: any[];
}

export class PlanGenerator {
  private roundData: any[];
  private specificProblem: string;
  private planDuration: number;
  private drills: DrillData[];
  private problemCategory: any;
  private userData: UserData | null;
  private isAIGenerated: boolean;
  
  constructor(
    roundData: any[], 
    specificProblem: string, 
    planDuration: string, 
    drills: DrillData[],
    userData?: UserData
  ) {
    this.roundData = roundData;
    this.specificProblem = specificProblem;
    this.planDuration = parseInt(planDuration) || 1;
    this.drills = drills || []; // Ensure drills is never undefined
    this.userData = userData || null;
    
    // Determine if this is an AI-generated plan or user-specified problem
    this.isAIGenerated = !specificProblem || specificProblem === "Improve overall golf performance";
    
    // Identify the problem category when the plan generator is created
    this.problemCategory = identifyProblemCategory(specificProblem);
    
    console.log(`Problem categorized as: ${this.problemCategory?.name || 'Uncategorized'}`);
    if (this.problemCategory) {
      console.log(`Related clubs: ${this.problemCategory.relatedClubs.join(', ')}`);
      console.log(`Primary outcome metrics: ${this.problemCategory.outcomeMetrics.join(', ')}`);
    }
  }

  private getRelevantDrills(): DrillData[] {
    // Handle case when no drills are provided
    if (!this.drills || this.drills.length === 0) {
      console.log("No drills available to filter");
      return [];
    }
    
    if (!this.specificProblem) return this.drills;

    // Special handling for putting problems
    const isPuttingProblem = this.specificProblem.toLowerCase().includes('putt');
    
    // Handle special cases by problem type
    if (isPuttingProblem) {
      // Pre-filter to only include putting-related drills for putting problems
      const puttingDrills = this.drills.filter(drill => isPuttingRelated(drill));
      console.log(`Found ${puttingDrills.length} putting-specific drills`);
      
      // If we have enough putting drills, use only those
      if (puttingDrills.length >= 5) {
        console.log("Using putting-specific drills only");
        return this.rankDrillsByRelevance(puttingDrills);
      }
    }

    return this.rankDrillsByRelevance(this.drills);
  }
  
  private rankDrillsByRelevance(drillsToRank: DrillData[]): DrillData[] {
    const searchTerms = this.problemCategory ?
      extractRelevantSearchTerms(this.specificProblem, this.problemCategory) :
      this.specificProblem.toLowerCase()
        .split(/[\s-]+/)
        .filter(term => term.length > 2)
        .map(term => term.replace(/[^a-z]/g, ''));

    console.log(`Using search terms: ${searchTerms.join(', ')}`);

    // Score and sort all drills
    const scoredDrills = drillsToRank
      .filter(drill => drill && drill.title && !drill.title.toLowerCase().includes('challenge'))
      .map(drill => {
        const drillText = [
          drill.title?.toLowerCase() || '',
          drill.overview?.toLowerCase() || '',
          drill.category?.toLowerCase() || '',
          ...(Array.isArray(drill.focus) ? drill.focus.map(f => f.toLowerCase()) : [])
        ].join(' ');

        // Enhanced relevance scoring with user handicap level factored in
        const baseRelevanceScore = getDrillRelevanceScore(
          drillText, 
          searchTerms, 
          this.specificProblem,
          this.problemCategory
        );
        
        // Special boost for category-specific drills
        let categoryBoost = 0;
        
        // Special boost for putting drills if this is a putting problem
        if (this.specificProblem.toLowerCase().includes('putt') && isPuttingRelated(drill)) {
          categoryBoost += 0.5;
          console.log(`Boosting putting drill: ${drill.title}`);
        }
        
        // Adjust score based on user's handicap level if available
        let handicapAdjustment = 0;
        if (this.userData?.userData?.handicap_level && drill.difficulty) {
          const handicapLevel = this.userData.userData.handicap_level;
          const drillDifficulty = drill.difficulty.toLowerCase();
          
          // Match appropriate difficulty to handicap level
          if (
            (handicapLevel === 'beginner' && drillDifficulty === 'beginner') ||
            (handicapLevel === 'intermediate' && drillDifficulty === 'intermediate') ||
            (handicapLevel === 'advanced' && drillDifficulty === 'advanced') ||
            (handicapLevel === 'expert' && drillDifficulty === 'expert')
          ) {
            handicapAdjustment = 0.2; // Boost matching difficulty
          } else if (
            (handicapLevel === 'beginner' && drillDifficulty === 'intermediate') ||
            (handicapLevel === 'intermediate' && (drillDifficulty === 'beginner' || drillDifficulty === 'advanced')) ||
            (handicapLevel === 'advanced' && (drillDifficulty === 'intermediate' || drillDifficulty === 'expert'))
          ) {
            handicapAdjustment = 0.1; // Slight boost for adjacent difficulty levels
          }
        }
        
        const finalScore = baseRelevanceScore + handicapAdjustment + categoryBoost;
        
        // Log high-scoring drills for debugging
        if (finalScore > 0.7) {
          console.log(`High-scoring drill: ${drill.title} (${finalScore.toFixed(2)})`);
        }
        
        return { 
          ...drill, 
          relevanceScore: finalScore 
        };
      })
      .filter(drill => drill.relevanceScore > 0.2) // Only keep somewhat relevant drills
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    console.log(`Found ${scoredDrills.length} relevant drills for "${this.specificProblem}"`);
    
    // Take top 8 most relevant drills to ensure variety
    const selectedDrills = scoredDrills.slice(0, 8);
    
    // If we don't have enough drills, add some fundamental drills
    if (selectedDrills.length < 4) {
      const fundamentalDrills = this.drills.filter(drill => {
        // Safe guard against undefined drills
        if (!drill || !drill.title) return false;
        
        const drillText = drill.title.toLowerCase();
        return drillText.includes('basic') || drillText.includes('fundamental');
      }).slice(0, 4 - selectedDrills.length);
      
      return [...selectedDrills, ...fundamentalDrills];
    }

    return selectedDrills;
  }

  private validateDailyPlans(days: PlanDay[]): PlanDay[] {
    const relevantDrills = this.getRelevantDrills();
    
    // If no relevant drills are found, create some dummy drills for the plan
    if (!relevantDrills || relevantDrills.length === 0) {
      console.log("No relevant drills found, creating generic practice plan");
      
      // Create a generic plan with focus areas but no specific drills
      return Array.from({ length: this.planDuration }, (_, index) => ({
        day: index + 1,
        focus: `Day ${index + 1}: General Practice`,
        duration: "30 minutes",
        drills: [] // Empty drills array since we don't have any relevant drills
      }));
    }
    
    // Make sure we have different drills for each day
    // We'll use a rotating approach to ensure variety between days
    return days.map((day, index) => {
      const validDay = {
        day: day.day || index + 1,
        focus: day.focus || `Golf practice day ${index + 1}`,
        duration: day.duration || "30 minutes",
        drills: Array.isArray(day.drills) ? day.drills : []
      };

      // Ensure we have at least 2-3 drills per day, with variety between days
      if (!validDay.drills || validDay.drills.length < 2) {
        // Distribute drills across days in a way that ensures variety
        const drillsPerDay = Math.min(3, Math.ceil(relevantDrills.length / 2));
        
        // The starting drill index will rotate for each day to ensure different drills
        const startIdx = (index * drillsPerDay) % Math.max(relevantDrills.length, 1);
        let drillsForDay: DrillData[] = [];
        
        // Get primary drills using a rotating window into our relevant drills
        for (let i = 0; i < drillsPerDay && i < relevantDrills.length; i++) {
          const drillIndex = (startIdx + i) % relevantDrills.length;
          drillsForDay.push(relevantDrills[drillIndex]);
        }
        
        // For additional variety, add a different drill from the back of the list
        if (relevantDrills.length > 0) {  // Add safety check here
          const extraDrillIndex = (relevantDrills.length - 1 - index) % relevantDrills.length;
          if (extraDrillIndex >= 0 && !drillsForDay.includes(relevantDrills[extraDrillIndex])) {
            drillsForDay.push(relevantDrills[extraDrillIndex]);
          }
        }
        
        // Make sure we don't have duplicate drills in the day
        drillsForDay = Array.from(new Set(drillsForDay));
        
        validDay.drills = drillsForDay.map(drill => ({
          id: drill.id,
          sets: 3,
          reps: 10,
          drill // Include the full drill object
        }));
      }

      return validDay;
    });
  }

  // Updated method to generate performance metrics based on round data
  private generatePerformanceData(): { performance: any } {
    // Default values that will be used if no real data is available
    const defaultPerformance = {
      driving: 60,
      ironPlay: 45,
      chipping: 70,
      bunker: 40,
      putting: 65
    };
    
    // If no round data, return the default metrics but mark as placeholder data
    if (!this.roundData || this.roundData.length === 0) {
      return { 
        performance: defaultPerformance,
        isPlaceholder: true
      };
    }
    
    try {
      // Calculate metrics based on round data
      const metrics = {
        driving: this.calculateDrivingMetric(),
        ironPlay: this.calculateIronPlayMetric(),
        chipping: this.calculateChippingMetric(),
        bunker: this.calculateBunkerMetric(),
        putting: this.calculatePuttingMetric()
      };
      
      // Check if we have enough real data to use
      const hasRealData = Object.values(metrics).some(value => value !== null && value !== undefined);
      
      // If we have real data, use it; otherwise use default values
      return { 
        performance: hasRealData ? metrics : defaultPerformance,
        isPlaceholder: !hasRealData
      };
    } catch (error) {
      console.error("Error calculating performance metrics:", error);
      return { 
        performance: defaultPerformance,
        isPlaceholder: true
      };
    }
  }
  
  private calculateDrivingMetric(): number {
    // If no rounds data, return null
    if (!this.roundData || this.roundData.length === 0) return 50;
    
    // Calculate average fairways hit percentage
    let totalFairways = 0;
    let totalFairwaysHit = 0;
    
    this.roundData.forEach(round => {
      if (round.fairways_hit !== undefined && round.hole_count) {
        // Assume ~14 fairways per 18 holes
        const fairwaysPerRound = round.hole_count === 18 ? 14 : 7;
        totalFairways += fairwaysPerRound;
        totalFairwaysHit += round.fairways_hit;
      }
    });
    
    // If no fairway data, return baseline score
    if (totalFairways === 0) return 50;
    
    // Calculate fairway hit percentage and convert to a 0-100 scale
    const fairwayHitPercentage = (totalFairwaysHit / totalFairways) * 100;
    
    // Transform percentage to a 0-100 scale where:
    // 0% hit = ~20 score
    // 50% hit = ~60 score
    // 100% hit = ~95 score
    return Math.min(95, Math.max(20, 40 + fairwayHitPercentage * 1.1));
  }
  
  private calculateIronPlayMetric(): number {
    // If no rounds data, return null
    if (!this.roundData || this.roundData.length === 0) return 50;
    
    // Calculate greens in regulation percentage
    let totalHoles = 0;
    let totalGIR = 0;
    
    this.roundData.forEach(round => {
      if (round.greens_in_regulation !== undefined && round.hole_count) {
        totalHoles += round.hole_count;
        totalGIR += round.greens_in_regulation;
      }
    });
    
    // If no GIR data, return baseline score
    if (totalHoles === 0) return 50;
    
    // Calculate GIR percentage and convert to a 0-100 scale
    const girPercentage = (totalGIR / totalHoles) * 100;
    
    // Transform percentage to a 0-100 scale where:
    // 0% GIR = ~20 score
    // 33% GIR = ~50 score (tour average is around 66%)
    // 66% GIR = ~80 score 
    // 100% GIR = 95 score
    return Math.min(95, Math.max(20, 20 + girPercentage * 0.75));
  }
  
  private calculateChippingMetric(): number {
    // For chipping, we don't have direct metrics, so we'll infer from 
    // the relationship between GIR and scoring
    if (!this.roundData || this.roundData.length === 0) return 50;
    
    // Calculate average score relative to par and GIR
    let totalScoreRelativeToPar = 0;
    let totalHoles = 0;
    let totalGIR = 0;
    
    this.roundData.forEach(round => {
      if (round.total_score && round.hole_count) {
        // Assuming par is typically 72 for 18 holes or 36 for 9 holes
        const parEstimate = round.hole_count === 18 ? 72 : 36;
        totalScoreRelativeToPar += (round.total_score - parEstimate);
        totalHoles += round.hole_count;
        
        if (round.greens_in_regulation !== undefined) {
          totalGIR += round.greens_in_regulation;
        }
      }
    });
    
    // If no scoring data, return baseline
    if (totalHoles === 0) return 50;
    
    // Calculate average strokes over par per hole
    const avgStrokesOverParPerHole = totalScoreRelativeToPar / totalHoles;
    
    // Calculate missed greens
    const missedGreens = totalHoles - totalGIR;
    
    // If no missed greens (unlikely), return high score
    if (missedGreens === 0) return 85;
    
    // Calculate average strokes over par per missed green
    // This gives us a sense of short game recovery skills
    const recoveryEfficiency = totalScoreRelativeToPar / missedGreens;
    
    // Transform to a 0-100 scale:
    // Higher efficiency (less strokes lost per missed green) = higher score
    // Typical values would be between 0.5-1.5 strokes lost per missed green
    return Math.min(95, Math.max(20, 100 - (recoveryEfficiency * 30)));
  }
  
  private calculateBunkerMetric(): number {
    // Bunker play is difficult to assess without specific bunker stats
    // We'll use a combination of handicap level and overall scoring
    
    // Return a slightly randomized score based on handicap level to add variation
    const handicapLevel = this.userData?.userData?.handicap_level;
    let baseScore = 50; // Default middle value
    
    if (handicapLevel) {
      switch (handicapLevel) {
        case 'beginner':
          baseScore = 30;
          break;
        case 'novice':
          baseScore = 40;
          break;
        case 'intermediate':
          baseScore = 55;
          break;
        case 'advanced':
          baseScore = 70;
          break;
        case 'expert':
          baseScore = 80;
          break;
        case 'pro':
          baseScore = 90;
          break;
      }
    }
    
    // Add a little randomization (+/- 10 points)
    const randomFactor = Math.floor(Math.random() * 20) - 10;
    return Math.min(95, Math.max(20, baseScore + randomFactor));
  }
  
  private calculatePuttingMetric(): number {
    // If no rounds data, return null
    if (!this.roundData || this.roundData.length === 0) return 50;
    
    // Calculate average putts per hole
    let totalPutts = 0;
    let totalHoles = 0;
    
    this.roundData.forEach(round => {
      if (round.total_putts !== undefined && round.hole_count) {
        totalPutts += round.total_putts;
        totalHoles += round.hole_count;
      }
    });
    
    // If no putting data, return baseline score
    if (totalHoles === 0) return 50;
    
    // Calculate putts per hole
    const puttsPerHole = totalPutts / totalHoles;
    
    // Transform putts per hole to a 0-100 scale:
    // 1.5 putts/hole = ~95 score (exceptional)
    // 1.8 putts/hole = ~80 score (very good)
    // 2.0 putts/hole = ~65 score (good amateur)
    // 2.2 putts/hole = ~50 score (average amateur)
    // 2.5+ putts/hole = <40 score (needs improvement)
    if (puttsPerHole <= 1.5) return 95;
    if (puttsPerHole <= 1.8) return 80 - ((puttsPerHole - 1.5) * 50);
    if (puttsPerHole <= 2.0) return 65 - ((puttsPerHole - 1.8) * 75);
    if (puttsPerHole <= 2.2) return 50 - ((puttsPerHole - 2.0) * 75);
    if (puttsPerHole <= 2.5) return 35 - ((puttsPerHole - 2.2) * 50);
    return Math.max(20, 20 - ((puttsPerHole - 2.5) * 30));
  }

  // Analyze round data to identify performance patterns
  private analyzePerformanceFromRounds() {
    if (!this.roundData || this.roundData.length === 0) {
      return [];
    }
    
    try {
      const insights = [];
      let totalFairwaysHit = 0;
      let totalFairways = 0;
      let totalGreensInRegulation = 0;
      let totalHoles = 0;
      let totalPutts = 0;
      let totalScores = 0;
      
      // Aggregate metrics across rounds
      this.roundData.forEach(round => {
        if (round.fairways_hit) {
          totalFairwaysHit += round.fairways_hit;
          totalFairways += 14; // Assuming 14 fairways per round
        }
        
        if (round.greens_in_regulation) {
          totalGreensInRegulation += round.greens_in_regulation;
          totalHoles += round.hole_count || 18;
        }
        
        if (round.total_putts) {
          totalPutts += round.total_putts;
        }
        
        if (round.total_score) {
          totalScores += round.total_score;
        }
      });
      
      // Calculate averages
      const roundCount = this.roundData.length;
      const avgFairwayHitPercent = totalFairways > 0 ? (totalFairwaysHit / totalFairways * 100).toFixed(1) : null;
      const avgGIRPercent = totalHoles > 0 ? (totalGreensInRegulation / totalHoles * 100).toFixed(1) : null;
      const avgPuttsPerRound = roundCount > 0 ? (totalPutts / roundCount).toFixed(1) : null;
      const avgScore = roundCount > 0 ? (totalScores / roundCount).toFixed(1) : null;
      
      // Generate insights based on the metrics
      if (avgFairwayHitPercent) {
        if (parseFloat(avgFairwayHitPercent) < 50) {
          insights.push({
            area: "Driving Accuracy",
            description: `Your fairway hit percentage is ${avgFairwayHitPercent}%, which is below average. Focus on improving driving accuracy.`,
            priority: "High"
          });
        } else {
          insights.push({
            area: "Driving Accuracy",
            description: `You're hitting ${avgFairwayHitPercent}% of fairways, which is solid. Keep working on consistency.`,
            priority: "Low"
          });
        }
      }
      
      if (avgGIRPercent) {
        if (parseFloat(avgGIRPercent) < 40) {
          insights.push({
            area: "Approach Play",
            description: `Your GIR percentage is ${avgGIRPercent}%, which indicates room for improvement in iron play.`,
            priority: "High"
          });
        } else {
          insights.push({
            area: "Approach Play",
            description: `You're hitting ${avgGIRPercent}% of greens in regulation, which is good. Focus on proximity to the pin.`,
            priority: "Medium"
          });
        }
      }
      
      if (avgPuttsPerRound) {
        const puttsPerHole = parseFloat(avgPuttsPerRound) / 18;
        if (puttsPerHole > 2) {
          insights.push({
            area: "Putting",
            description: `Averaging ${avgPuttsPerRound} putts per round (${puttsPerHole.toFixed(1)} per hole) indicates opportunity for improvement on the greens.`,
            priority: "High"
          });
        } else {
          insights.push({
            area: "Putting",
            description: `Averaging ${avgPuttsPerRound} putts per round is solid. Continue working on lag putting and short putts.`,
            priority: "Medium"
          });
        }
      }
      
      return insights;
    } catch (error) {
      console.error("Error analyzing round data:", error);
      return [];
    }
  }

  // Analyze challenge results for patterns
  private analyzePerformanceFromChallenges() {
    if (!this.userData?.challengeResults || this.userData.challengeResults.length === 0) {
      return [];
    }
    
    try {
      const insights = [];
      const challengesByCategory = new Map();
      
      // Group challenges by category
      this.userData.challengeResults.forEach(challenge => {
        const category = challenge.challenge_id?.category || 'Unknown';
        if (!challengesByCategory.has(category)) {
          challengesByCategory.set(category, []);
        }
        challengesByCategory.get(category).push(challenge);
      });
      
      // Analyze performance by category
      for (const [category, challenges] of challengesByCategory.entries()) {
        const avgProgress = challenges.reduce((sum, c) => sum + c.progress, 0) / challenges.length;
        
        if (avgProgress < 50) {
          insights.push({
            area: category,
            description: `Your average completion for ${category} challenges is ${avgProgress.toFixed(0)}%. Focus on improving skills in this area.`,
            priority: "High"
          });
        } else if (avgProgress < 80) {
          insights.push({
            area: category,
            description: `You're making good progress in ${category} challenges (${avgProgress.toFixed(0)}%). Continue to develop these skills.`,
            priority: "Medium"
          });
        } else {
          insights.push({
            area: category,
            description: `You're showing strength in ${category} challenges with ${avgProgress.toFixed(0)}% completion. Consider more advanced drills.`,
            priority: "Low"
          });
        }
      }
      
      return insights;
    } catch (error) {
      console.error("Error analyzing challenge data:", error);
      return [];
    }
  }

  async generatePlan(challenges: any[]): Promise<AIResponse> {
    const relevantDrills = this.getRelevantDrills();
    
    // Initialize our helper classes
    const diagnosisGenerator = new DiagnosisGenerator(
      this.specificProblem, 
      this.problemCategory,
      this.userData?.userData?.handicap_level,
      this.isAIGenerated
    );
    
    const practiceDayGenerator = new PracticeDayGenerator(
      this.specificProblem, 
      this.problemCategory
    );
    
    const challengeSelector = new ChallengeSelector(
      this.specificProblem, 
      this.problemCategory, 
      this.userData?.userData?.handicap_level
    );
    
    let selectedChallenge = challengeSelector.selectChallenge(challenges);
    
    console.log(`Selected challenge for problem "${this.specificProblem}":`, 
                selectedChallenge ? selectedChallenge.title : 'None found');

    // Generate performance insights from round data and challenges
    const roundInsights = this.analyzePerformanceFromRounds();
    const challengeInsights = this.analyzePerformanceFromChallenges();
    const combinedInsights = [...roundInsights, ...challengeInsights];
    
    // Generate performance metrics data for the radar chart
    const performanceData = this.generatePerformanceData();
    
    // Create practice plan days with a more balanced distribution of drills
    const dailyPlans = Array.from({ length: this.planDuration }, (_, i) => {
      // Generate unique focus for each day
      const dayFocus = practiceDayGenerator.getFocusByDay(i);
      
      // If no relevant drills are found, create days with focus areas but no drills
      if (!relevantDrills || relevantDrills.length === 0) {
        return {
          day: i + 1,
          focus: `Day ${i + 1}: ${dayFocus}`,
          duration: "45 minutes",
          drills: [] // Empty drills array
        };
      }
      
      // Calculate how many drills to include per day to ensure variety
      // We want 2-3 drills per day with minimal repetition
      const drillsPerDay = Math.min(3, Math.ceil(relevantDrills.length / this.planDuration));
      
      // Select drills in a rotating pattern to ensure each day has different drills
      const startIndex = (i * drillsPerDay) % relevantDrills.length;
      
      // Get initial set of drills for this day
      const dayDrills = [];
      for (let j = 0; j < drillsPerDay && j < relevantDrills.length; j++) {
        const index = (startIndex + j) % relevantDrills.length;
        if (relevantDrills[index]) {
          dayDrills.push(relevantDrills[index]);
        }
      }
      
      // Add one more drill for variety (from a different part of the list)
      if (relevantDrills.length > 0) { // Safety check
        const extraDrillIndex = (relevantDrills.length - 1 - i) % relevantDrills.length;
        if (extraDrillIndex >= 0 && relevantDrills[extraDrillIndex] && 
            !dayDrills.includes(relevantDrills[extraDrillIndex])) {
          dayDrills.push(relevantDrills[extraDrillIndex]);
        }
      }
      
      // Ensure no duplicates
      const uniqueDrills = Array.from(new Set(dayDrills));
      
      return {
        day: i + 1,
        focus: `Day ${i + 1}: ${dayFocus}`,
        duration: "45 minutes",
        drills: uniqueDrills.map(drill => ({
          drill,
          sets: 3,
          reps: 10
        }))
      };
    });

    const validatedPlans = this.validateDailyPlans(dailyPlans);
    
    // Generate a more personalized diagnosis using user profile data
    const detailedDiagnosis = diagnosisGenerator.generateDiagnosis(
      this.userData?.userData?.score_goal,
      combinedInsights
    );
    
    const rootCauses = diagnosisGenerator.generateRootCauses(combinedInsights);

    // If we have a score goal and no specific challenge, create a goal-oriented challenge
    if (!selectedChallenge && this.userData?.userData?.score_goal) {
      const scoreGoal = this.userData.userData.score_goal;
      const handicapLevel = this.userData.userData.handicap_level || 'intermediate';
      
      // Create a custom score-oriented challenge
      selectedChallenge = {
        id: 'custom-goal-challenge',
        title: `Score Improvement Challenge: Path to ${scoreGoal}`,
        description: `A personalized challenge designed to help you reach your goal score of ${scoreGoal}.`,
        difficulty: handicapLevel,
        category: 'Score Improvement',
        metric: 'Score',
        metrics: ['Score', 'Confidence'],
        instruction1: 'Complete each practice session in your plan with full focus and intention.',
        instruction2: 'Track your progress after each practice session, noting improvements and challenges.',
        instruction3: `Play a full round applying what you've learned and aim for a score of ${scoreGoal} or better.`,
        attempts: 9
      };
    }

    return {
      diagnosis: detailedDiagnosis,
      rootCauses: rootCauses,
      practicePlan: {
        plan: validatedPlans,
        challenge: selectedChallenge,
        performanceInsights: {
          performance: performanceData.performance,
          isPlaceholder: performanceData.isPlaceholder
        }
      },
      performanceInsights: combinedInsights,
      isAIGenerated: this.isAIGenerated
    };
  }
}
