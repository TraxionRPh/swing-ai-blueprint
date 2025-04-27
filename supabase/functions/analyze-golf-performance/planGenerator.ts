
import { DrillData, PlanDay, AIResponse } from './types';
import { getDrillRelevanceScore, getChallengeRelevanceScore } from './drillMatching';

export class PlanGenerator {
  private roundData: any[];
  private specificProblem: string;
  private planDuration: number;
  private drills: DrillData[];

  constructor(roundData: any[], specificProblem: string, planDuration: string, drills: DrillData[]) {
    this.roundData = roundData;
    this.specificProblem = specificProblem;
    this.planDuration = parseInt(planDuration) || 1;
    this.drills = drills;
  }

  private getRelevantDrills(): DrillData[] {
    if (!this.specificProblem) return this.drills;

    const searchTerms = this.specificProblem.toLowerCase()
      .split(/[\s-]+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/[^a-z]/g, ''));

    const exactMatches: DrillData[] = [];
    const relatedMatches: DrillData[] = [];
    const possibleMatches: DrillData[] = [];

    this.drills.forEach(drill => {
      const drillText = [
        drill.title?.toLowerCase() || '',
        drill.overview?.toLowerCase() || '',
        drill.category?.toLowerCase() || '',
        ...(drill.focus?.map(f => f.toLowerCase()) || [])
      ].join(' ');

      const relevanceScore = getDrillRelevanceScore(drillText, searchTerms, this.specificProblem.toLowerCase());
      const drillWithScore = { ...drill, relevanceScore };

      if (relevanceScore > 0.7) {
        exactMatches.push(drillWithScore);
      } else if (relevanceScore > 0.4) {
        relatedMatches.push(drillWithScore);
      } else if (relevanceScore > 0.2) {
        possibleMatches.push(drillWithScore);
      }
    });

    const sortByRelevance = (a: DrillData, b: DrillData) => 
      (b.relevanceScore || 0) - (a.relevanceScore || 0);

    exactMatches.sort(sortByRelevance);
    relatedMatches.sort(sortByRelevance);
    possibleMatches.sort(sortByRelevance);

    let matchedDrills = [...exactMatches];
    if (matchedDrills.length < 6) {
      matchedDrills = [...matchedDrills, ...relatedMatches.slice(0, 6 - matchedDrills.length)];
    }
    if (matchedDrills.length < 3) {
      matchedDrills = [...matchedDrills, ...possibleMatches.slice(0, 3 - matchedDrills.length)];
    }

    return matchedDrills.length > 0 ? matchedDrills : this.drills.slice(0, 3);
  }

  private validateDailyPlans(days: PlanDay[]): PlanDay[] {
    return days.map((day, index) => {
      const validDay = {
        day: day.day || index + 1,
        focus: day.focus || `Golf practice day ${index + 1}`,
        duration: day.duration || "30 minutes",
        drills: Array.isArray(day.drills) ? day.drills : []
      };

      const validDrills = this.getRelevantDrills();
      const dayFocus = validDay.focus.toLowerCase();
      const filteredDrills = validDrills.filter(drill => {
        const drillText = [
          drill.title?.toLowerCase() || '',
          drill.overview?.toLowerCase() || '',
          ...(drill.focus?.map(f => f.toLowerCase()) || []),
          drill.category?.toLowerCase() || ''
        ].join(' ');

        return getDrillRelevanceScore(drillText, [dayFocus], this.specificProblem.toLowerCase()) > 0.2;
      });

      if (!validDay.drills || validDay.drills.length < 2) {
        validDay.drills = filteredDrills.slice(0, 3).map(drill => ({
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
    
    // Select most relevant challenge
    let selectedChallenge = null;
    let highestScore = 0;

    if (challenges?.length > 0) {
      for (const challenge of challenges) {
        const relevanceScore = getChallengeRelevanceScore(challenge, this.specificProblem);
        if (relevanceScore > highestScore) {
          highestScore = relevanceScore;
          selectedChallenge = challenge;
        }
      }
    }

    const dailyPlans = Array.from({ length: this.planDuration }, (_, i) => ({
      day: i + 1,
      focus: `Day ${i + 1} Practice`,
      duration: "45 minutes",
      drills: relevantDrills.slice(i * 2, (i * 2) + 3).map(drill => ({
        id: drill.id,
        sets: 3,
        reps: 10
      }))
    }));

    const validatedPlans = this.validateDailyPlans(dailyPlans);

    return {
      diagnosis: `Analysis of your ${this.specificProblem.toLowerCase()} technique`,
      rootCauses: ["Technical analysis completed"],
      practicePlan: {
        plan: validatedPlans,
        challenge: selectedChallenge
      }
    };
  }
}
