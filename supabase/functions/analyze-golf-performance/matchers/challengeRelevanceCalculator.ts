
import { ProblemCategory } from '../golfCategorization.ts';

export class ChallengeRelevanceCalculator {
  private challenge: any;
  private specificProblem: string;
  private problemCategory?: ProblemCategory | null;

  constructor(
    challenge: any,
    specificProblem: string,
    problemCategory?: ProblemCategory | null
  ) {
    this.challenge = challenge;
    this.specificProblem = specificProblem.toLowerCase();
    this.problemCategory = problemCategory;
  }

  calculateScore(): number {
    if (!this.challenge || !this.specificProblem) {
      return 0;
    }

    const challengeText = this.getChallengeText();
    let score = 0;

    if (this.problemCategory) {
      score += this.calculateMetricMatchScore();
      score += this.calculateKeywordMatchScore(challengeText);
      score += this.calculateClubMatchScore(challengeText);
    }

    score += this.calculateCategorySpecificScore(challengeText);
    score += this.calculateTitleAndMetricMatchScore();
    score += this.calculateDefaultChallengeScore(challengeText);

    // Specific problem match scoring
    score += this.calculateProblemSpecificScore();

    return Math.min(score, 1);
  }

  private getChallengeText(): string {
    const challengeFields = [
      this.challenge.title || '',
      this.challenge.description || '',
      this.challenge.category || '',
      this.challenge.metric || '',
      ...(Array.isArray(this.challenge.metrics) ? this.challenge.metrics.filter(Boolean) : [])
    ].filter(Boolean);
    
    return challengeFields.join(' ').toLowerCase();
  }

  private calculateMetricMatchScore(): number {
    let score = 0;
    if (!this.problemCategory) return score;

    for (const metric of this.problemCategory.outcomeMetrics) {
      if (this.challenge.metric?.toLowerCase() === metric.toLowerCase() ||
          (Array.isArray(this.challenge.metrics) && 
           this.challenge.metrics.some(m => m?.toLowerCase() === metric.toLowerCase()))) {
        score += 0.5;
        break;
      }
    }
    return score;
  }

  private calculateKeywordMatchScore(challengeText: string): number {
    let score = 0;
    if (!this.problemCategory) return score;

    for (const keyword of this.problemCategory.keywords) {
      if (challengeText.includes(keyword)) {
        score += 0.1;
      }
    }
    return score;
  }

  private calculateClubMatchScore(challengeText: string): number {
    let score = 0;
    if (!this.problemCategory) return score;

    for (const club of this.problemCategory.relatedClubs) {
      if (challengeText.includes(club)) {
        score += 0.15;
      }
    }
    return score;
  }

  private calculateCategorySpecificScore(challengeText: string): number {
    const category = this.problemCategory?.name.toLowerCase() || '';
    let score = 0;

    switch(category) {
      case "ball striking":
        if (challengeText.includes('green') || 
            challengeText.includes('approach') ||
            challengeText.includes('iron') ||
            challengeText.includes('gir') ||
            challengeText.includes('regulation') ||
            challengeText.includes('contact')) {
          score += 0.6;
        }
        break;
      case "driving accuracy":
        if (challengeText.includes('fairway') || 
            challengeText.includes('accuracy') ||
            challengeText.includes('driving') ||
            challengeText.includes('direction')) {
          score += 0.5;
        }
        break;
      case "putting":
        if (challengeText.includes('putt') || 
            challengeText.includes('putts') ||
            challengeText.includes('green')) {
          score += 0.8; // Increase this score for putting problems
        }
        break;
      case "short game":
        if (challengeText.includes('chip') || 
            challengeText.includes('up and down') ||
            challengeText.includes('short game')) {
          score += 0.5;
        }
        break;
    }
    return score;
  }

  private calculateTitleAndMetricMatchScore(): number {
    let score = 0;
    
    if (this.challenge.category?.toLowerCase().includes(this.specificProblem.split(' ')[0])) {
      score += 0.3;
    }

    if (Array.isArray(this.challenge.metrics)) {
      for (const metric of this.challenge.metrics) {
        if (typeof metric === 'string' && this.specificProblem.includes(metric.toLowerCase())) {
          score += 0.2;
          break;
        }
      }
    }

    if (this.challenge.title?.toLowerCase().includes(this.specificProblem)) {
      score += 0.4;
    }

    return score;
  }

  private calculateDefaultChallengeScore(challengeText: string): number {
    if (this.calculateTitleAndMetricMatchScore() === 0 && 
      (challengeText.includes('general') || 
       challengeText.includes('basic') || 
       challengeText.includes('standard'))) {
      return 0.2;
    }
    return 0;
  }
  
  private calculateProblemSpecificScore(): number {
    let score = 0;
    
    // Specific match for topping the ball problems
    if (this.specificProblem.includes('topping') || this.specificProblem.includes('top')) {
      const challengeText = this.getChallengeText();
      if (challengeText.includes('contact') || 
          challengeText.includes('strike') || 
          challengeText.includes('ball first') || 
          challengeText.includes('divot')) {
        score += 0.7;  // Strong boost for topping challenges
      }
    }
    
    return score;
  }
}
