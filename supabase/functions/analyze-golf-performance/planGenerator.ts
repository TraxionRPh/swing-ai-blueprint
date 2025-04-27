
import { DrillData, PlanDay, AIResponse } from './types.ts';
import { getDrillRelevanceScore, getChallengeRelevanceScore } from './drillMatching.ts';

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

  private generateDetailedDiagnosis(): string {
    const problem = this.specificProblem.toLowerCase();
    
    // Generate a detailed diagnosis based on the specific problem
    if (problem.includes('slice') || problem.includes('slicing')) {
      if (problem.includes('driver')) {
        return `Your driver slice is likely caused by an outside-to-in swing path combined with an open clubface at impact. This creates side spin that sends the ball curving to the right (for right-handed golfers). Analysis of your swing suggests you may be starting your downswing with your upper body, creating an over-the-top move that cuts across the ball. Additionally, your grip might be contributing to the open clubface position at impact.`;
      } else {
        return `Your slice is characterized by a ball flight that starts straight but curves significantly to the right (for right-handed golfers). This happens due to an outside-to-in swing path combined with an open clubface at impact. The data indicates your swing likely has a steeper angle of attack, cutting across the ball and creating excessive side spin. Your grip and alignment also appear to be contributing factors to this ball flight pattern.`;
      }
    } else if (problem.includes('hook')) {
      return `Your hook is characterized by a ball that starts right of target and curves dramatically left (for right-handed golfers). Analysis shows your swing likely has an in-to-out path combined with a closed clubface at impact. This creates counter-clockwise spin on the ball, causing the pronounced leftward curve. Your grip may be too strong, and your release through impact appears to be too active, closing the face too rapidly.`;
    } else if (problem.includes('putt') || problem.includes('putting')) {
      return `Analysis of your putting stroke reveals inconsistencies in your tempo and path. The data suggests you may be struggling with distance control and direction. Your stroke appears to have subtle variations in pace and path that affect consistency. Additionally, your setup position shows some inconsistency in eye position relative to the ball and minor variations in your stance width.`;
    } else if (problem.includes('chip') || problem.includes('short game')) {
      return `Your chipping technique shows inconsistencies in contact quality and distance control. Data analysis indicates you may be using too much wrist action during your chipping stroke, creating inconsistent low point control. Your weight distribution appears to favor your back foot more than ideal for clean contact, and your clubface control through impact shows room for improvement.`;
    } else if (problem.includes('bunker')) {
      return `Analysis of your bunker play indicates challenges with depth perception and sand interaction. You appear to be struggling with consistently getting the club to enter the sand at the optimal point behind the ball. Your swing tends to be either too steep or too shallow, resulting in inconsistent sand displacement. Weight distribution during the swing also shows some instability.`;
    } else {
      return `Analysis of your ${this.specificProblem} technique reveals several technical patterns that are affecting your consistency and performance. Your mechanics show room for improvement in areas of tempo, path, and position at key points in the swing. The data indicates specific focus areas that can help you achieve more consistent results.`;
    }
  }

  private generateRootCauses(): string[] {
    const problem = this.specificProblem.toLowerCase();
    
    // Generate root causes based on the specific problem
    if (problem.includes('slice') || problem.includes('slicing')) {
      return [
        "Outside-to-in swing path cutting across the ball",
        "Open clubface at impact relative to swing path",
        "Improper grip position allowing the face to open",
        "Over-rotation of the upper body in the backswing",
        "Starting the downswing with the shoulders instead of the lower body"
      ];
    } else if (problem.includes('hook')) {
      return [
        "Inside-to-out swing path",
        "Closed clubface at impact relative to swing path",
        "Excessively strong grip position",
        "Over-active release of the hands through impact",
        "Lower body sliding rather than rotating in downswing"
      ];
    } else if (problem.includes('putt') || problem.includes('putting')) {
      return [
        "Inconsistent stroke path leading to directional issues",
        "Variable tempo affecting distance control",
        "Inconsistent setup position and eye alignment",
        "Grip pressure changes during stroke",
        "Head movement during putting stroke"
      ];
    } else if (problem.includes('chip') || problem.includes('short game')) {
      return [
        "Excessive wrist action during chipping motion",
        "Inconsistent low point control",
        "Weight favoring back foot during stroke",
        "Variable ball position in stance",
        "Inconsistent clubface control through impact"
      ];
    } else if (problem.includes('bunker')) {
      return [
        "Inconsistent entry point in sand",
        "Variable swing depth in sand",
        "Deceleration through impact",
        "Improper weight distribution during swing",
        "Failure to keep clubface open through impact"
      ];
    } else {
      return [
        "Technical inconsistencies in your fundamental mechanics",
        "Alignment and setup issues affecting your swing plane",
        "Tempo and timing variations leading to inconsistent contact",
        "Grip and pressure points that may be limiting your control",
        "Body rotation and sequencing issues affecting power and accuracy"
      ];
    }
  }

  async generatePlan(challenges: any[]): Promise<AIResponse> {
    const relevantDrills = this.getRelevantDrills();
    
    // Select most relevant challenge
    let selectedChallenge = null;
    let highestScore = 0;

    console.log(`Selecting from ${challenges?.length || 0} available challenges`);

    if (challenges && Array.isArray(challenges) && challenges.length > 0) {
      console.log("Processing challenges for relevance");
      for (const challenge of challenges) {
        const relevanceScore = getChallengeRelevanceScore(challenge, this.specificProblem);
        console.log(`Challenge "${challenge.title}" has relevance score: ${relevanceScore}`);
        
        if (relevanceScore > highestScore) {
          highestScore = relevanceScore;
          selectedChallenge = challenge;
          
          // Calculate attempts based on instructions
          const attemptCount = [
            challenge.instruction1, 
            challenge.instruction2, 
            challenge.instruction3
          ].filter(Boolean).length * 3;
          
          selectedChallenge.attempts = attemptCount > 0 ? attemptCount : 9;
        }
      }
      
      console.log(`Selected challenge: ${selectedChallenge?.title || 'None found'}`);
    } else {
      console.log("No challenges available to select from");
    }

    const dailyPlans = Array.from({ length: this.planDuration }, (_, i) => ({
      day: i + 1,
      focus: `Day ${i + 1}: ${this.getFocusByDay(i, this.specificProblem)}`,
      duration: "45 minutes",
      drills: relevantDrills.slice(i * 2, (i * 2) + 3).map(drill => ({
        id: drill.id,
        sets: 3,
        reps: 10
      }))
    }));

    const validatedPlans = this.validateDailyPlans(dailyPlans);
    const detailedDiagnosis = this.generateDetailedDiagnosis();
    const rootCauses = this.generateRootCauses();

    return {
      diagnosis: detailedDiagnosis,
      rootCauses: rootCauses,
      practicePlan: {
        plan: validatedPlans,
        challenge: selectedChallenge
      }
    };
  }
  
  private getFocusByDay(dayIndex: number, problem: string): string {
    const problemLower = problem.toLowerCase();
    
    // Create focused practice descriptions based on problem type
    if (problemLower.includes('slice') || problemLower.includes('hook')) {
      const focuses = [
        "Grip and Setup Correction",
        "Swing Path Training",
        "Impact Position and Release",
        "Full Swing Integration"
      ];
      return focuses[dayIndex % focuses.length];
    }
    
    if (problemLower.includes('putt') || problemLower.includes('putting')) {
      const focuses = [
        "Stroke Path and Face Control",
        "Distance Control Training",
        "Reading Greens and Alignment",
        "Pressure Putting Practice"
      ];
      return focuses[dayIndex % focuses.length];
    }
    
    if (problemLower.includes('chip') || problemLower.includes('short game')) {
      const focuses = [
        "Basic Chipping Technique",
        "Distance Control Around Greens",
        "Different Lies and Situations",
        "Short Game Scoring Drills"
      ];
      return focuses[dayIndex % focuses.length];
    }
    
    // Default focuses if nothing specific matches
    const defaultFocuses = [
      "Fundamental Mechanics",
      "Technical Refinement",
      "Performance Training",
      "Integration and Testing"
    ];
    
    return defaultFocuses[dayIndex % defaultFocuses.length];
  }
}
