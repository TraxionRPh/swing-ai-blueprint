
import { DrillData, PlanDay, AIResponse } from './types.ts';
import { getDrillRelevanceScore } from './drillMatching.ts';
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

    const searchTerms = this.problemCategory ?
      extractRelevantSearchTerms(this.specificProblem, this.problemCategory) :
      this.specificProblem.toLowerCase()
        .split(/[\s-]+/)
        .filter(term => term.length > 2)
        .map(term => term.replace(/[^a-z]/g, ''));

    console.log(`Using search terms: ${searchTerms.join(', ')}`);

    // Score and sort all drills
    const scoredDrills = this.drills
      .filter(drill => drill && drill.title && !drill.title.toLowerCase().includes('challenge'))
      .map(drill => {
        const drillText = [
          drill.title?.toLowerCase() || '',
          drill.overview?.toLowerCase() || '',
          drill.category?.toLowerCase() || '',
          ...(drill.focus?.map(f => f.toLowerCase()) || [])
        ].join(' ');

        // Enhanced relevance scoring with user handicap level factored in
        const baseRelevanceScore = getDrillRelevanceScore(
          drillText, 
          searchTerms, 
          this.specificProblem,
          this.problemCategory
        );
        
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
        
        return { 
          ...drill, 
          relevanceScore: baseRelevanceScore + handicapAdjustment 
        };
      })
      .filter(drill => drill.relevanceScore > 0.2) // Only keep somewhat relevant drills
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    console.log(`Found ${scoredDrills.length} relevant drills for "${this.specificProblem}"`);
    
    // Take top 6 most relevant drills
    const selectedDrills = scoredDrills.slice(0, 6);
    
    // If we don't have enough drills, add some fundamental drills
    if (selectedDrills.length < 3) {
      const fundamentalDrills = this.drills.filter(drill => {
        // Safe guard against undefined drills
        if (!drill || !drill.title) return false;
        
        const drillText = drill.title.toLowerCase();
        return drillText.includes('basic') || drillText.includes('fundamental');
      }).slice(0, 3 - selectedDrills.length);
      
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
    
    return days.map((day, index) => {
      const validDay = {
        day: day.day || index + 1,
        focus: day.focus || `Golf practice day ${index + 1}`,
        duration: day.duration || "30 minutes",
        drills: Array.isArray(day.drills) ? day.drills : []
      };

      if (!validDay.drills || validDay.drills.length < 2) {
        // Use a smarter method to distribute drills across days
        // Make sure each day gets different drills
        const drillsPerDay = Math.max(3, Math.min(relevantDrills.length, Math.ceil(relevantDrills.length / this.planDuration)));
        const startIdx = (index * drillsPerDay) % Math.max(relevantDrills.length, 1);
        let drillsForDay: DrillData[] = [];
        
        for (let i = 0; i < drillsPerDay && i < relevantDrills.length; i++) {
          const drillIndex = (startIdx + i) % relevantDrills.length;
          drillsForDay.push(relevantDrills[drillIndex]);
        }
        
        validDay.drills = drillsForDay.map(drill => ({
          id: drill.id,
          sets: 3,
          reps: 10
        }));
      }

      return validDay;
    });
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
      this.userData?.userData?.handicap_level
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
    
    // Create practice plan days with a more balanced distribution of drills
    const dailyPlans = Array.from({ length: this.planDuration }, (_, i) => {
      // If no relevant drills are found, create days with focus areas but no drills
      if (!relevantDrills || relevantDrills.length === 0) {
        return {
          day: i + 1,
          focus: `Day ${i + 1}: ${practiceDayGenerator.getFocusByDay(i)}`,
          duration: "45 minutes",
          drills: [] // Empty drills array
        };
      }
      
      // Make sure drills are evenly distributed across days
      const drillsPerDay = Math.min(3, Math.ceil(relevantDrills.length / this.planDuration));
      const startIndex = (i * drillsPerDay) % relevantDrills.length;
      
      const dayDrills = [];
      for (let j = 0; j < drillsPerDay && j < relevantDrills.length; j++) {
        const index = (startIndex + j) % relevantDrills.length;
        if (relevantDrills[index]) {
          dayDrills.push(relevantDrills[index]);
        }
      }
      
      return {
        day: i + 1,
        focus: `Day ${i + 1}: ${practiceDayGenerator.getFocusByDay(i)}`,
        duration: "45 minutes",
        drills: dayDrills.map(drill => ({
          id: drill.id,
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
        challenge: selectedChallenge
      },
      performanceInsights: combinedInsights
    };
  }
}
