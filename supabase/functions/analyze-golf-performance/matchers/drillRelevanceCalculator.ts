
import { ProblemCategory } from '../golfCategorization.ts';

/**
 * Calculator for determining drill relevance to a specific golf problem
 */
export class DrillRelevanceCalculator {
  private drillText: string;
  private searchTerms: string[];
  private specificProblem: string;
  private problemCategory: ProblemCategory | null;
  
  constructor(
    drillText: string, 
    searchTerms: string[], 
    specificProblem: string,
    problemCategory?: ProblemCategory | null
  ) {
    this.drillText = drillText.toLowerCase();
    this.searchTerms = searchTerms.map(term => term.toLowerCase());
    this.specificProblem = specificProblem.toLowerCase();
    this.problemCategory = problemCategory || null;
  }
  
  /**
   * Calculate the relevance score for this drill
   */
  calculateScore(): number {
    let score = 0;
    
    // STRICT ENFORCEMENT: Check if this is a putting-related problem
    const isPuttingProblem = this.specificProblem.includes('putt') || 
                           this.specificProblem.includes('green') ||
                           this.specificProblem.includes('speed on the green') ||
                           this.specificProblem.includes('hole') ||
                           this.specificProblem.includes('lag');
    
    if (isPuttingProblem) {
      // For putting problems, we ONLY want putting drills
      if (this.isPuttingDrill()) {
        score += 1.0; // Strong boost for putting drills
      } else {
        return 0.0; // COMPLETELY EXCLUDE non-putting drills from putting plans
      }
    }
    
    // Special handling for bunker/sand problems
    const isBunkerProblem = this.specificProblem.includes('bunker') || 
                           this.specificProblem.includes('sand');
    
    if (isBunkerProblem) {
      // For bunker problems, prioritize bunker drills
      if (this.isBunkerDrill()) {
        score += 0.8; // Strong boost for bunker drills
      } else {
        return 0.1; // Very low score for non-bunker drills when bunker is the problem
      }
    }
    
    // Match search terms
    for (const term of this.searchTerms) {
      if (this.drillText.includes(term)) {
        score += 0.1;
        
        // Higher score for terms in title (more relevant)
        if (this.drillText.split('title:')[1]?.includes(term)) {
          score += 0.2;
        }
      }
    }
    
    // Match problem-specific keywords
    const problemKeywords = this.specificProblem
      .split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.toLowerCase());
    
    for (const keyword of problemKeywords) {
      if (this.drillText.includes(keyword)) {
        score += 0.1;
      }
    }
    
    // If we have a problem category, add score based on category match
    if (this.problemCategory) {
      if (this.drillText.includes(this.problemCategory.name.toLowerCase())) {
        score += 0.3;
      }
      
      // Check for related club mentions
      for (const club of this.problemCategory.relatedClubs) {
        if (this.drillText.includes(club.toLowerCase())) {
          score += 0.2;
        }
      }
    }
    
    return score;
  }
  
  /**
   * STRICT DETERMINATIONS: Is this a putting-related drill
   * Enhanced with stricter category checking
   */
  private isPuttingDrill(): boolean {
    // STRICT CATEGORY CHECK - highest priority and most reliable indicator
    if (this.drillText.includes('category: putting') || 
        this.drillText.includes('category:"putting"') ||
        this.drillText.includes('category: "putting"') ||
        this.drillText.includes('category:putting')) {
      return true;
    }
    
    // Check for putting terms in title - strong indicator
    if (this.drillText.includes('title:') && 
        (this.drillText.split('title:')[1].includes('putt') || 
         this.drillText.split('title:')[1].includes('green') ||
         this.drillText.split('title:')[1].includes('lag') ||
         this.drillText.split('title:')[1].includes('hole'))) {
      return true;
    }
    
    // Check for putting terms in focus areas
    if (this.drillText.includes('focus:') && 
        (this.drillText.split('focus:')[1].includes('putt') || 
         this.drillText.split('focus:')[1].includes('green'))) {
      return true;
    }
    
    // General checks for putting keywords - more comprehensive
    const puttingTerms = ['putt', 'green', 'hole', 'cup', 'lag', 'roll', 'stroke', 'line', 'speed'];
    let puttingTermCount = 0;
    
    for (const term of puttingTerms) {
      if (this.drillText.includes(term)) {
        puttingTermCount++;
      }
    }
    
    // STRICT EXCLUSION: Exclude drills with strong non-putting indicators
    if (this.drillText.includes('iron') || 
        this.drillText.includes('driver') || 
        this.drillText.includes('chip') || 
        this.drillText.includes('sand') ||
        this.drillText.includes('bunker') ||
        this.drillText.includes('wedge') ||
        this.drillText.includes('full swing')) {
      // If these terms appear more than putting terms, it's not a putting drill
      const nonPuttingTerms = ['iron', 'driver', 'chip', 'sand', 'bunker', 'wedge', 'full swing'];
      let nonPuttingCount = 0;
      
      for (const term of nonPuttingTerms) {
        if (this.drillText.includes(term)) {
          nonPuttingCount++;
        }
      }
      
      if (nonPuttingCount >= puttingTermCount) {
        return false;
      }
    }
    
    return puttingTermCount >= 2; // Require at least 2 putting terms to ensure it's putting-focused
  }
  
  /**
   * Determine if this is a bunker-related drill
   */
  private isBunkerDrill(): boolean {
    // Direct category check
    if (this.drillText.includes('category: bunker') || 
        this.drillText.includes('category:"bunker"') ||
        this.drillText.includes('category: sand') || 
        this.drillText.includes('category:"sand"')) {
      return true;
    }
    
    // Check for bunker terms in title
    if (this.drillText.includes('title:') && 
        (this.drillText.split('title:')[1].includes('bunker') || 
         this.drillText.split('title:')[1].includes('sand'))) {
      return true;
    }
    
    // Check for bunker terms in focus areas
    if (this.drillText.includes('focus:') && 
        (this.drillText.split('focus:')[1].includes('bunker') || 
         this.drillText.split('focus:')[1].includes('sand'))) {
      return true;
    }
    
    // General checks for bunker keywords
    const bunkerTerms = ['bunker', 'sand', 'trap', 'explosion', 'splash'];
    let bunkerTermCount = 0;
    
    for (const term of bunkerTerms) {
      if (this.drillText.includes(term)) {
        bunkerTermCount++;
      }
    }
    
    return bunkerTermCount >= 1; // Only require 1 bunker term as they're more specific
  }
}
