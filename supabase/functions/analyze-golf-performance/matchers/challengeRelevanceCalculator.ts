
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
    
    // STRICT CATEGORY ENFORCEMENT FOR VARIOUS PROBLEM TYPES
    
    // PUTTING: Check if this is a putting problem with strict enforcement
    const isPuttingProblem = this.specificProblem.includes('putt') || 
                           this.specificProblem.includes('green') ||
                           this.specificProblem.includes('speed on the green') ||
                           this.specificProblem.includes('hole') ||
                           this.specificProblem.includes('lag');
                           
    if (isPuttingProblem && !this.isPuttingChallenge(challengeText)) {
      return -1; // Completely disqualify non-putting challenges for putting problems
    }
    
    // DRIVING: Check for driver-related problems with strict enforcement
    const isDrivingProblem = this.specificProblem.includes('driver') ||
                           this.specificProblem.includes('tee shot') ||
                           this.specificProblem.includes('off the tee') ||
                           this.specificProblem.includes('slice') ||
                           this.specificProblem.includes('hook');
                           
    if (isDrivingProblem && !this.isDrivingChallenge(challengeText)) {
      return -1; // Disqualify non-driving challenges for driving problems
    }
    
    // IRON PLAY: Check for iron play problems with strict enforcement
    const isIronProblem = this.specificProblem.includes('iron') ||
                        this.specificProblem.includes('approach') ||
                        this.specificProblem.includes('ball striking') ||
                        this.specificProblem.includes('contact');
                        
    if (isIronProblem && !this.isIronChallenge(challengeText)) {
      return -1; // Disqualify non-iron challenges for iron problems
    }
    
    // SHORT GAME: Check for chipping/pitching problems with strict enforcement
    const isChippingProblem = this.specificProblem.includes('chip') ||
                            this.specificProblem.includes('pitch') ||
                            this.specificProblem.includes('short game') ||
                            this.specificProblem.includes('around the green');
                            
    if (isChippingProblem && !this.isChippingChallenge(challengeText)) {
      return -1; // Disqualify non-chipping challenges for short game problems
    }
    
    // BUNKER: Check for bunker/sand problems with strict enforcement
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
  
  private isDrivingChallenge(challengeText: string): boolean {
    // Check category directly first
    if (this.challenge.category && 
        (this.challenge.category.toLowerCase().includes('driv') || 
         this.challenge.category.toLowerCase().includes('tee'))) {
      return true;
    }
    
    // Check title for driver references
    if (this.challenge.title && 
        (this.challenge.title.toLowerCase().includes('driv') || 
         this.challenge.title.toLowerCase().includes('tee') ||
         this.challenge.title.toLowerCase().includes('slice') ||
         this.challenge.title.toLowerCase().includes('hook'))) {
      return true;
    }
    
    // Count driving terminology
    const drivingTerms = ['driver', 'tee shot', 'off the tee', 'slice', 'hook', 'draw', 'fade'];
    let count = 0;
    
    for (const term of drivingTerms) {
      if (challengeText.includes(term)) {
        count++;
      }
    }
    
    return count >= 2; // Need at least 2 driving terms to qualify
  }
  
  private isIronChallenge(challengeText: string): boolean {
    // Check category directly first
    if (this.challenge.category && 
        (this.challenge.category.toLowerCase().includes('iron') || 
         this.challenge.category.toLowerCase().includes('approach') ||
         this.challenge.category.toLowerCase().includes('ball striking'))) {
      return true;
    }
    
    // Check title for iron references
    if (this.challenge.title && 
        (this.challenge.title.toLowerCase().includes('iron') || 
         this.challenge.title.toLowerCase().includes('approach') ||
         this.challenge.title.toLowerCase().includes('contact') ||
         this.challenge.title.toLowerCase().includes('ball striking'))) {
      return true;
    }
    
    // Count iron terminology
    const ironTerms = ['iron', 'approach', 'fairway', 'ball striking', 'contact', 'compress', 'divot'];
    let count = 0;
    
    for (const term of ironTerms) {
      if (challengeText.includes(term)) {
        count++;
      }
    }
    
    return count >= 2; // Need at least 2 iron terms to qualify
  }
  
  private isChippingChallenge(challengeText: string): boolean {
    // Check category directly first
    if (this.challenge.category && 
        (this.challenge.category.toLowerCase().includes('chip') || 
         this.challenge.category.toLowerCase().includes('pitch') ||
         this.challenge.category.toLowerCase().includes('short game'))) {
      return true;
    }
    
    // Check title for chipping references
    if (this.challenge.title && 
        (this.challenge.title.toLowerCase().includes('chip') || 
         this.challenge.title.toLowerCase().includes('pitch') ||
         this.challenge.title.toLowerCase().includes('short game'))) {
      return true;
    }
    
    // Count chipping terminology
    const chippingTerms = ['chip', 'pitch', 'short game', 'around the green', 'up and down', 'flop', 'lob'];
    let count = 0;
    
    for (const term of chippingTerms) {
      if (challengeText.includes(term)) {
        count++;
      }
    }
    
    return count >= 1; // Just one chipping term is sufficient as they're specific
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
