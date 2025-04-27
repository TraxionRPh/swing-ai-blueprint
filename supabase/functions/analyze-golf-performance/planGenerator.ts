
import { DrillData, PlanDay, AIResponse } from './types.ts';
import { getDrillRelevanceScore } from './drillMatching.ts';
import { identifyProblemCategory } from './golfCategorization.ts';
import { DiagnosisGenerator } from './DiagnosisGenerator.ts';
import { PracticeDayGenerator } from './PracticeDayGenerator.ts';
import { ChallengeSelector } from './ChallengeSelector.ts';

export class PlanGenerator {
  private roundData: any[];
  private specificProblem: string;
  private planDuration: number;
  private drills: DrillData[];
  private problemCategory: any;

  constructor(roundData: any[], specificProblem: string, planDuration: string, drills: DrillData[]) {
    this.roundData = roundData;
    this.specificProblem = specificProblem;
    this.planDuration = parseInt(planDuration) || 1;
    this.drills = drills;
    
    // Identify the problem category when the plan generator is created
    this.problemCategory = identifyProblemCategory(specificProblem);
    
    console.log(`Problem categorized as: ${this.problemCategory?.name || 'Uncategorized'}`);
    if (this.problemCategory) {
      console.log(`Related clubs: ${this.problemCategory.relatedClubs.join(', ')}`);
      console.log(`Primary outcome metrics: ${this.problemCategory.outcomeMetrics.join(', ')}`);
    }
  }

  private getRelevantDrills(): DrillData[] {
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
      .filter(drill => !drill.title.toLowerCase().includes('challenge'))
      .map(drill => {
        const drillText = [
          drill.title?.toLowerCase() || '',
          drill.overview?.toLowerCase() || '',
          drill.category?.toLowerCase() || '',
          ...(drill.focus?.map(f => f.toLowerCase()) || [])
        ].join(' ');

        const relevanceScore = getDrillRelevanceScore(
          drillText, 
          searchTerms, 
          this.specificProblem,
          this.problemCategory
        );
        
        return { ...drill, relevanceScore };
      })
      .filter(drill => drill.relevanceScore > 0.2) // Only keep somewhat relevant drills
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    console.log(`Found ${scoredDrills.length} relevant drills for "${this.specificProblem}"`);
    
    // Take top 6 most relevant drills
    const selectedDrills = scoredDrills.slice(0, 6);
    
    // If we don't have enough drills, add some fundamental drills
    if (selectedDrills.length < 3) {
      const fundamentalDrills = this.drills.filter(drill => {
        const drillText = drill.title?.toLowerCase() || '';
        return drillText.includes('basic') || drillText.includes('fundamental');
      }).slice(0, 3 - selectedDrills.length);
      
      return [...selectedDrills, ...fundamentalDrills];
    }

    return selectedDrills;
  }

  private validateDailyPlans(days: PlanDay[]): PlanDay[] {
    const relevantDrills = this.getRelevantDrills();
    
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
        
        for (let i = 0; i < drillsPerDay; i++) {
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

  async generatePlan(challenges: any[]): Promise<AIResponse> {
    const relevantDrills = this.getRelevantDrills();
    
    // Initialize our helper classes
    const diagnosisGenerator = new DiagnosisGenerator(this.specificProblem, this.problemCategory);
    const practiceDayGenerator = new PracticeDayGenerator(this.specificProblem, this.problemCategory);
    const challengeSelector = new ChallengeSelector(this.specificProblem, this.problemCategory);
    
    const selectedChallenge = challengeSelector.selectChallenge(challenges);
    
    console.log(`Selected challenge for problem "${this.specificProblem}":`, 
                selectedChallenge ? selectedChallenge.title : 'None found');

    // Create practice plan days with a more balanced distribution of drills
    const dailyPlans = Array.from({ length: this.planDuration }, (_, i) => {
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
    const detailedDiagnosis = diagnosisGenerator.generateDiagnosis();
    const rootCauses = diagnosisGenerator.generateRootCauses();

    return {
      diagnosis: detailedDiagnosis,
      rootCauses: rootCauses,
      practicePlan: {
        plan: validatedPlans,
        challenge: selectedChallenge
      }
    };
  }
}

