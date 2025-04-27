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
    const fallbackMatches: DrillData[] = [];

    const actualDrills = this.drills.filter(drill => 
      !drill.title.toLowerCase().includes('challenge'));

    const isIronContactIssue = this.specificProblem.toLowerCase().includes('chunk') || 
                              this.specificProblem.toLowerCase().includes('iron contact') || 
                              this.specificProblem.toLowerCase().includes('iron strike') ||
                              this.specificProblem.toLowerCase().includes('ball striking');

    actualDrills.forEach(drill => {
      const drillText = [
        drill.title?.toLowerCase() || '',
        drill.overview?.toLowerCase() || '',
        drill.category?.toLowerCase() || '',
        ...(drill.focus?.map(f => f.toLowerCase()) || [])
      ].join(' ');

      let relevanceScore = getDrillRelevanceScore(drillText, searchTerms, this.specificProblem.toLowerCase());
      
      if (isIronContactIssue) {
        if (drillText.includes('contact') || 
            drillText.includes('strike') || 
            drillText.includes('compression') ||
            drillText.includes('ball first') ||
            drillText.includes('chunk') ||
            drillText.includes('turf interaction') ||
            (drillText.includes('iron') && (drillText.includes('solid') || drillText.includes('pure')))) {
          relevanceScore += 0.3;
        }
      }
      
      const drillWithScore = { ...drill, relevanceScore };

      if (relevanceScore > 0.7) {
        exactMatches.push(drillWithScore);
      } else if (relevanceScore > 0.4) {
        relatedMatches.push(drillWithScore);
      } else if (relevanceScore > 0.2) {
        possibleMatches.push(drillWithScore);
      } else {
        fallbackMatches.push(drillWithScore);
      }
    });

    const sortByRelevance = (a: DrillData, b: DrillData) => 
      (b.relevanceScore || 0) - (a.relevanceScore || 0);

    exactMatches.sort(sortByRelevance);
    relatedMatches.sort(sortByRelevance);
    possibleMatches.sort(sortByRelevance);
    fallbackMatches.sort(sortByRelevance);

    let matchedDrills = [...exactMatches];
    if (matchedDrills.length < 6) {
      matchedDrills = [...matchedDrills, ...relatedMatches.slice(0, 6 - matchedDrills.length)];
    }
    if (matchedDrills.length < 6) {
      matchedDrills = [...matchedDrills, ...possibleMatches.slice(0, 6 - matchedDrills.length)];
    }
    
    if (matchedDrills.length < 3) {
      matchedDrills = [...matchedDrills, ...fallbackMatches.slice(0, 3 - matchedDrills.length)];
    }

    console.log(`Found ${matchedDrills.length} relevant drills for "${this.specificProblem}"`);
    
    return matchedDrills.length > 0 ? matchedDrills : actualDrills.slice(0, 3);
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

      const dayFocus = validDay.focus.toLowerCase();
      
      if (!validDay.drills || validDay.drills.length < 2) {
        const startIdx = (index * 2) % Math.max(relevantDrills.length, 1);
        const drillsNeeded = Math.min(3, relevantDrills.length);
        let drillsForDay: DrillData[] = [];
        
        for (let i = 0; i < drillsNeeded; i++) {
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

  private generateDetailedDiagnosis(): string {
    const problem = this.specificProblem.toLowerCase();
    
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
    } else if (problem.includes('chunk') || problem.includes('iron contact')) {
      return `Analysis of your iron contact issues reveals inconsistent low point control in your swing. The data suggests you're likely hitting behind the ball frequently, causing "chunked" shots where the club contacts the ground before the ball. This is often a result of your weight distribution staying too far on the back foot through impact, as well as a swing path that may be too steep. Your tendency to "scoop" or flip at impact could also be contributing to these contact issues. Improving your iron strikes will significantly lower your scores by increasing both accuracy and distance control.`;
    } else {
      return `Analysis of your ${this.specificProblem} technique reveals several technical patterns that are affecting your consistency and performance. Your mechanics show room for improvement in areas of tempo, path, and position at key points in the swing. The data indicates specific focus areas that can help you achieve more consistent results.`;
    }
  }

  private generateRootCauses(): string[] {
    const problem = this.specificProblem.toLowerCase();
    
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
    } else if (problem.includes('chunk') || problem.includes('iron contact')) {
      return [
        "Improper weight transfer keeping weight on back foot at impact",
        "Early extension causing inconsistent low point control",
        "Steep angle of attack causing the club to dig too deep",
        "Scooping or flipping motion with the hands through impact",
        "Poor setup position with ball too far forward in stance"
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

  private selectRelevantChallenge(challenges: any[], problem: string): any {
    if (!challenges || !Array.isArray(challenges) || challenges.length === 0) {
      console.log("No challenges available to select from");
      return this.createDefaultChallenge(problem);
    }

    const problemLower = problem.toLowerCase();
    let targetMetric = '';
    let challengeKeywords: string[] = [];

    if (problemLower.includes('slice') || problemLower.includes('hook') || 
        problemLower.includes('driver') || problemLower.includes('tee shot')) {
      targetMetric = 'Fairways Hit';
      challengeKeywords = ['fairway', 'accuracy', 'tee shot', 'driving'];
    } 
    else if (problemLower.includes('iron') || problemLower.includes('approach') || 
             problemLower.includes('contact') || problemLower.includes('chunk') || 
             problemLower.includes('ball striking')) {
      targetMetric = 'Greens in Regulation';
      challengeKeywords = ['green', 'approach', 'iron shot', 'gir', 'iron accuracy'];
    }
    else if (problemLower.includes('chip') || problemLower.includes('pitch') || 
             problemLower.includes('short game')) {
      targetMetric = 'Up and Down';
      challengeKeywords = ['chip', 'pitch', 'short game', 'around green'];
    }
    else if (problemLower.includes('putt') || problemLower.includes('putting')) {
      targetMetric = 'Putts';
      challengeKeywords = ['putt', 'putting', 'green', 'hole'];
    }

    console.log(`Looking for challenges with metric: ${targetMetric} and keywords:`, challengeKeywords);

    let bestMatch = null;
    let highestScore = 0;

    for (const challenge of challenges) {
      if (!challenge.title || !challenge.description) {
        continue;
      }
      
      let score = 0;

      if (challenge.metrics && Array.isArray(challenge.metrics)) {
        if (challenge.metrics.some(m => m?.toLowerCase() === targetMetric.toLowerCase())) {
          score += 2;
        }
      }
      
      if (challenge.metric && challenge.metric.toLowerCase() === targetMetric.toLowerCase()) {
        score += 2;
      }

      const challengeText = `${challenge.title} ${challenge.description}`.toLowerCase();
      challengeKeywords.forEach(keyword => {
        if (challengeText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = challenge;
      }
    }

    console.log(`Selected challenge: ${bestMatch?.title || 'None found'} with score: ${highestScore}`);

    if (bestMatch) {
      const attemptCount = [
        bestMatch.instruction1,
        bestMatch.instruction2,
        bestMatch.instruction3
      ].filter(Boolean).length * 3;

      return {
        ...bestMatch,
        attempts: attemptCount > 0 ? attemptCount : 9
      };
    }

    return this.createDefaultChallenge(problem);
  }

  private createDefaultChallenge(problem: string): any {
    const problemLower = problem.toLowerCase();
    
    if (problemLower.includes('iron') || problemLower.includes('contact') || 
        problemLower.includes('chunk') || problemLower.includes('ball striking')) {
      return {
        id: "default-challenge-iron",
        title: "Green in Regulation Challenge",
        description: "Test your iron accuracy by seeing how many greens you can hit in regulation",
        difficulty: "Medium",
        category: "Iron Play", 
        metrics: ["Greens in Regulation"],
        metric: "Greens in Regulation",
        instruction1: "Hit 9 approach shots with your irons",
        instruction2: "Count how many land and stay on the green",
        instruction3: "Calculate your green hit percentage",
        attempts: 9
      };
    }
    else if (problemLower.includes('slice') || problemLower.includes('hook') || 
             problemLower.includes('driver') || problemLower.includes('tee shot')) {
      return {
        id: "default-challenge-driver",
        title: "Fairway Accuracy Challenge",
        description: "Test your ability to hit fairways consistently with your driver",
        difficulty: "Medium",
        category: "Driving", 
        metrics: ["Fairways Hit"],
        metric: "Fairways Hit",
        instruction1: "Hit 10 drives aiming for the fairway",
        instruction2: "Count how many land in the fairway",
        instruction3: "Calculate your fairway hit percentage",
        attempts: 10
      };
    }
    else if (problemLower.includes('putt') || problemLower.includes('putting')) {
      return {
        id: "default-challenge-putting",
        title: "Putting Accuracy Challenge",
        description: "Test your putting accuracy with a series of medium-length putts",
        difficulty: "Medium",
        category: "Putting", 
        metrics: ["Putts"],
        metric: "Putts Made",
        instruction1: "Place 10 balls at 6-foot distances around a hole",
        instruction2: "Count how many putts you make",
        instruction3: "Calculate your putting percentage",
        attempts: 10
      };
    }
    else if (problemLower.includes('chip') || problemLower.includes('short game')) {
      return {
        id: "default-challenge-shortgame",
        title: "Up and Down Challenge",
        description: "Test your ability to get up and down from around the green",
        difficulty: "Medium",
        category: "Short Game", 
        metrics: ["Up and Down"],
        metric: "Up and Down",
        instruction1: "Place 9 balls at different positions around the green",
        instruction2: "Try to get each ball up and down in 2 shots or less",
        instruction3: "Count how many successful up and downs you complete",
        attempts: 9
      };
    }
    
    return {
      id: "default-challenge-generic",
      title: "Golf Accuracy Challenge",
      description: "Test your overall shot accuracy with a mixed set of shots",
      difficulty: "Medium",
      category: "General", 
      metrics: ["Accuracy"],
      metric: "Accuracy",
      instruction1: "Hit 9 shots targeting specific landing areas",
      instruction2: "Count how many hit the intended target",
      instruction3: "Calculate your accuracy percentage",
      attempts: 9
    };
  }

  async generatePlan(challenges: any[]): Promise<AIResponse> {
    const relevantDrills = this.getRelevantDrills();
    
    const selectedChallenge = this.selectRelevantChallenge(challenges, this.specificProblem);
    
    console.log(`Selected challenge for problem "${this.specificProblem}":`, 
                selectedChallenge ? selectedChallenge.title : 'None found');

    const dailyPlans = Array.from({ length: this.planDuration }, (_, i) => {
      const startIndex = (i * Math.ceil(relevantDrills.length / this.planDuration)) % relevantDrills.length;
      
      const dayDrills = [];
      for (let j = 0; j < 3; j++) {
        const index = (startIndex + j) % relevantDrills.length;
        dayDrills.push(relevantDrills[index]);
      }
      
      return {
        day: i + 1,
        focus: `Day ${i + 1}: ${this.getFocusByDay(i, this.specificProblem)}`,
        duration: "45 minutes",
        drills: dayDrills.map(drill => ({
          id: drill.id,
          sets: 3,
          reps: 10
        }))
      };
    });

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
    
    if (problemLower.includes('chunk') || problemLower.includes('iron contact')) {
      const focuses = [
        "Ball Position and Setup",
        "Weight Transfer and Low Point Control",
        "Impact Position and Follow Through",
        "Full Swing Integration"
      ];
      return focuses[dayIndex % focuses.length];
    }
    
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
    
    const defaultFocuses = [
      "Fundamental Mechanics",
      "Technical Refinement",
      "Performance Training",
      "Integration and Testing"
    ];
    
    return defaultFocuses[dayIndex % defaultFocuses.length];
  }
}
