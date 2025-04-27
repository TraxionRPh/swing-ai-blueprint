
import { ProblemCategory } from './golfCategorization.ts';

export class ChallengeSelector {
  private problem: string;
  private problemCategory: ProblemCategory | null;

  constructor(problem: string, problemCategory: ProblemCategory | null) {
    this.problem = problem;
    this.problemCategory = problemCategory;
  }

  createDefaultChallenge(): any {
    const category = this.problemCategory?.name.toLowerCase() || '';
    
    if (category === "ball striking") {
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
    
    if (category === "driving accuracy") {
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
    
    if (category === "putting") {
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
    
    if (category === "short game") {
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

  selectChallenge(challenges: any[]): any {
    if (!challenges || !Array.isArray(challenges) || challenges.length === 0) {
      console.log("No challenges available to select from");
      return this.createDefaultChallenge();
    }

    const category = this.problemCategory;
    const problemLower = this.problem.toLowerCase();
    
    console.log(`Selecting challenge for category: ${category?.name || 'Unknown'}`);
    
    let bestMatch = null;
    let highestScore = 0;

    for (const challenge of challenges) {
      if (!challenge.title || !challenge.description) {
        continue;
      }
      
      const score = this.getChallengeRelevanceScore(challenge);

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

    return this.createDefaultChallenge();
  }

  private getChallengeRelevanceScore(challenge: any): number {
    if (!challenge) {
      return 0;
    }

    const lowerProblem = this.problem.toLowerCase();
    
    // Combine all relevant challenge fields into a single string for matching
    const challengeFields = [
      challenge.title || '',
      challenge.description || '',
      challenge.category || '',
      challenge.metric || '',
      ...(Array.isArray(challenge.metrics) ? challenge.metrics.filter(Boolean) : [])
    ].filter(Boolean);
    
    const lowerChallenge = challengeFields.join(' ').toLowerCase();

    let score = 0;

    // Enhanced matching based on problem category
    if (this.problemCategory) {
      // Check if the challenge matches the primary outcome metric for this category
      for (const metric of this.problemCategory.outcomeMetrics) {
        if (challenge.metric?.toLowerCase() === metric.toLowerCase() ||
            (Array.isArray(challenge.metrics) && 
             challenge.metrics.some(m => m?.toLowerCase() === metric.toLowerCase()))) {
          score += 0.5;
          break;
        }
      }
      
      // Check if challenge matches any keywords from the category
      for (const keyword of this.problemCategory.keywords) {
        if (lowerChallenge.includes(keyword)) {
          score += 0.1;
        }
      }
      
      // Check if challenge matches any related clubs from the category
      for (const club of this.problemCategory.relatedClubs) {
        if (lowerChallenge.includes(club)) {
          score += 0.15;
        }
      }
    }

    // Original category-specific matching logic
    const category = this.problemCategory?.name.toLowerCase() || '';
    
    switch(category) {
      case "ball striking":
        if (lowerChallenge.includes('green') || 
            lowerChallenge.includes('approach') ||
            lowerChallenge.includes('iron') ||
            lowerChallenge.includes('gir') ||
            lowerChallenge.includes('regulation')) {
          score += 0.6;
        }
        break;
      case "driving accuracy":
        if (lowerChallenge.includes('fairway') || 
            lowerChallenge.includes('accuracy') ||
            lowerChallenge.includes('driving') ||
            lowerChallenge.includes('direction')) {
          score += 0.5;
        }
        break;
      case "putting":
        if (lowerChallenge.includes('putt') || 
            lowerChallenge.includes('putts') ||
            lowerChallenge.includes('green')) {
          score += 0.5;
        }
        break;
      case "short game":
        if (lowerChallenge.includes('chip') || 
            lowerChallenge.includes('up and down') ||
            lowerChallenge.includes('short game')) {
          score += 0.5;
        }
        break;
    }

    // Match categories
    if (challenge.category?.toLowerCase().includes(lowerProblem.split(' ')[0])) {
      score += 0.3;
    }

    // Match metrics to problem
    if (Array.isArray(challenge.metrics)) {
      for (const metric of challenge.metrics) {
        if (typeof metric === 'string' && lowerProblem.includes(metric.toLowerCase())) {
          score += 0.2;
          break;
        }
      }
    }

    // Additional scoring for title matches
    if (challenge.title?.toLowerCase().includes(lowerProblem)) {
      score += 0.4;
    }

    // If no specific match but has a default/general challenge
    if (score === 0 && 
      (lowerChallenge.includes('general') || 
       lowerChallenge.includes('basic') || 
       lowerChallenge.includes('standard'))) {
      score += 0.2;
    }

    return Math.min(score, 1);
  }
}

