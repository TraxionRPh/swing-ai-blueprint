
import { ProblemCategory, validateContextMatch } from '../golfCategorization.ts';
import { 
  calculateBunkerScore, 
  calculatePuttingScore, 
  calculateContactScore, 
  calculateGeneralScore,
  calculateInstructionRelevanceScore,
  checkCompoundTermMatches
} from './scoringStrategies.ts';

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
    
    // First validate basic context match using our enhanced validator
    if (this.problemCategory && !validateContextMatch(challengeText, this.specificProblem, this.problemCategory)) {
      // Special override for bunker problems
      const isBunkerProblem = this.specificProblem.includes('bunker') || this.specificProblem.includes('sand');
      const isBunkerChallenge = challengeText.includes('bunker') || challengeText.includes('sand');
      
      if (!(isBunkerProblem && isBunkerChallenge)) {
        return 0; // Skip this challenge if context doesn't match and it's not a bunker exception
      }
    }
    
    let score = 0;
    const scoringContext = {
      challengeText,
      specificProblem: this.specificProblem,
      problemCategory: this.problemCategory,
      challenge: this.challenge
    };

    // Apply different scoring strategies based on the problem type
    if (this.specificProblem.includes('bunker') || this.specificProblem.includes('sand')) {
      score += calculateBunkerScore(scoringContext);
    } 
    else if (this.specificProblem.includes('putt')) {
      score += calculatePuttingScore(scoringContext);
    }
    else if (this.specificProblem.includes('top') || 
             this.specificProblem.includes('thin') ||
             this.specificProblem.includes('contact')) {
      score += calculateContactScore(scoringContext);
    }
    
    // Apply general scoring for all challenges
    score += calculateGeneralScore(scoringContext);
    score += this.calculateCategorySpecificScore(challengeText);
    score += this.calculateTitleAndMetricMatchScore();
    score += calculateInstructionRelevanceScore(scoringContext);
    
    // Check for compound matches (multiple related terms)
    score += checkCompoundTermMatches(challengeText, this.specificProblem) * 3;

    return Math.min(score, 1); // Cap the score at 1.0
  }

  private getChallengeText(): string {
    const challengeFields = [
      this.challenge.title || '',
      this.challenge.description || '',
      this.challenge.category || '',
      this.challenge.metric || '',
      this.challenge.instruction1 || '',
      this.challenge.instruction2 || '',
      this.challenge.instruction3 || '',
      ...(Array.isArray(this.challenge.metrics) ? this.challenge.metrics.filter(Boolean) : [])
    ].filter(Boolean);
    
    return challengeFields.join(' ').toLowerCase();
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
          score += 0.8; // High score for putting relevance
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

    // Direct title match is very strong indicator
    if (this.challenge.title?.toLowerCase().includes(this.specificProblem)) {
      score += 0.4;
    }
    
    // Check for specific terms in title
    const problemTerms = this.specificProblem
      .split(/\s+/)
      .filter(term => term.length > 3);
      
    for (const term of problemTerms) {
      if (this.challenge.title?.toLowerCase().includes(term)) {
        score += 0.15;
      }
    }

    return score;
  }
}
