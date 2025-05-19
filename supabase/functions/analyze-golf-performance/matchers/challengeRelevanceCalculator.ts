
import { ProblemCategory } from '../golfCategorization.ts';

/**
 * Calculator for determining challenge relevance to a specific golf problem
 */
export class ChallengeRelevanceCalculator {
  private challenge: any;
  private specificProblem: string;
  private problemCategory: ProblemCategory | null;
  
  constructor(
    challenge: any, 
    specificProblem: string,
    problemCategory?: ProblemCategory | null
  ) {
    this.challenge = challenge;
    this.specificProblem = specificProblem.toLowerCase();
    this.problemCategory = problemCategory || null;
  }
  
  /**
   * Calculate the relevance score for this challenge
   */
  calculateScore(): number {
    if (!this.challenge) return -1;
    
    let score = 0;
    
    // Extract challenge text for relevance checking
    const challengeText = [
      this.challenge.title || '',
      this.challenge.description || '',
      this.challenge.category || '',
      this.challenge.instruction1 || '',
      this.challenge.instruction2 || '',
      this.challenge.instruction3 || ''
    ].join(' ').toLowerCase();
    
    // Special handling for putting problems - STRICTER FILTERING
    const isPuttingProblem = this.specificProblem.includes('putt') || 
                           this.specificProblem.includes('green') ||
                           this.specificProblem.includes('speed on the green') ||
                           this.specificProblem.includes('hole') ||
                           this.specificProblem.includes('lag');
                           
    if (isPuttingProblem && !this.isPuttingChallenge(challengeText)) {
      return -1; // Disqualify non-putting challenges for putting problems
    }
    
    // Special handling for bunker/sand problems
    const isBunkerProblem = this.specificProblem.includes('bunker') || 
                          this.specificProblem.includes('sand');
                          
    if (isBunkerProblem && !this.isBunkerChallenge(challengeText)) {
      return -1; // Disqualify non-bunker challenges for bunker problems
    }
    
    // Direct category match (strong signal)
    if (this.challenge.category && 
        this.specificProblem.includes(this.challenge.category.toLowerCase())) {
      score += 5;
    }
    
    // Title match (strong signal)
    if (this.challenge.title) {
      const titleWords = this.challenge.title.toLowerCase().split(/\s+/);
      for (const word of titleWords) {
        if (word.length > 3 && this.specificProblem.includes(word)) {
          score += 2;
        }
      }
    }
    
    // Content match
    const problemWords = this.specificProblem
      .split(/\s+/)
      .filter(word => word.length > 3);
      
    for (const word of problemWords) {
      if (challengeText.includes(word)) {
        score += 1;
      }
    }
    
    // Problem category match
    if (this.problemCategory && 
        this.challenge.category && 
        this.challenge.category.toLowerCase().includes(this.problemCategory.name.toLowerCase())) {
      score += 3;
    }
    
    return score;
  }
  
  private isPuttingChallenge(challengeText: string): boolean {
    // Check category directly first - most reliable indicator
    if (this.challenge.category && 
        this.challenge.category.toLowerCase().includes('putt')) {
      return true;
    }
    
    // Check title for putting references - also highly reliable
    if (this.challenge.title && 
        (this.challenge.title.toLowerCase().includes('putt') || 
         this.challenge.title.toLowerCase().includes('green'))) {
      return true;
    }
    
    // Count putting terminology - more comprehensive check
    const puttingTerms = ['putt', 'green', 'hole', 'cup', 'stroke', 'line', 'roll', 'lag', 'speed'];
    let puttingTermCount = 0;
    
    for (const term of puttingTerms) {
      if (challengeText.includes(term)) {
        puttingTermCount++;
      }
    }
    
    return puttingTermCount >= 2; // Need at least 2 putting terms to qualify
  }
  
  private isBunkerChallenge(challengeText: string): boolean {
    // Check category directly first
    if (this.challenge.category && 
        (this.challenge.category.toLowerCase().includes('bunker') || 
         this.challenge.category.toLowerCase().includes('sand'))) {
      return true;
    }
    
    // Check title for bunker references
    if (this.challenge.title && 
        (this.challenge.title.toLowerCase().includes('bunker') || 
         this.challenge.title.toLowerCase().includes('sand'))) {
      return true;
    }
    
    // Count bunker terminology
    const bunkerTerms = ['bunker', 'sand', 'trap', 'explosion', 'splash'];
    
    for (const term of bunkerTerms) {
      if (challengeText.includes(term)) {
        return true; // Just one bunker term is sufficient
      }
    }
    
    return false;
  }
}
