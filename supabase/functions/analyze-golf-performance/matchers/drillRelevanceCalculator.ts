
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
    
    // Check for strict category matches by problem type
    
    // PUTTING: Strict enforcement for putting problems
    const isPuttingProblem = this.specificProblem.includes('putt') || 
                           this.specificProblem.includes('green') ||
                           this.specificProblem.includes('speed on the green') ||
                           this.specificProblem.includes('hole') ||
                           this.specificProblem.includes('lag');
    
    // DRIVING: Strict enforcement for driver/tee shot problems
    const isDrivingProblem = this.specificProblem.includes('driver') ||
                           this.specificProblem.includes('tee shot') ||
                           this.specificProblem.includes('off the tee') ||
                           this.specificProblem.includes('slice') ||
                           this.specificProblem.includes('hook');
                          
    // IRON PLAY: Strict enforcement for iron play problems
    const isIronProblem = this.specificProblem.includes('iron') ||
                        this.specificProblem.includes('approach') ||
                        this.specificProblem.includes('ball striking') ||
                        this.specificProblem.includes(' mid game') ||
                        this.specificProblem.includes('fairway');
                        
    // SHORT GAME: Strict enforcement for chipping/pitching problems
    const isChippingProblem = this.specificProblem.includes('chip') ||
                            this.specificProblem.includes('pitch') ||
                            this.specificProblem.includes('short game') ||
                            this.specificProblem.includes('around the green');
                            
    // BUNKER: Strict enforcement for bunker/sand problems
    const isBunkerProblem = this.specificProblem.includes('bunker') || 
                          this.specificProblem.includes('sand');
    
    // Apply strict category filtering based on problem type
    if (isPuttingProblem) {
      if (this.isPuttingDrill()) {
        score += 1.0; // Strong boost for putting drills
      } else {
        return 0.0; // COMPLETELY EXCLUDE non-putting drills from putting plans
      }
    } 
    else if (isDrivingProblem) {
      if (this.isDrivingDrill()) {
        score += 1.0; // Strong boost for driving drills
      } else {
        return 0.0; // COMPLETELY EXCLUDE non-driving drills from driving plans
      }
    }
    else if (isIronProblem) {
      if (this.isIronDrill()) {
        score += 1.0; // Strong boost for iron drills
      } else {
        return 0.0; // COMPLETELY EXCLUDE non-iron drills from iron play plans
      }
    }
    else if (isChippingProblem) {
      if (this.isChippingDrill()) {
        score += 1.0; // Strong boost for chipping drills
      } else {
        return 0.0; // COMPLETELY EXCLUDE non-chipping drills from short game plans
      }
    }
    else if (isBunkerProblem) {
      if (this.isBunkerDrill()) {
        score += 0.8; // Strong boost for bunker drills
      } else {
        return 0.1; // Very low score for non-bunker drills when bunker is the problem
      }
    }
    
    // If we get here, apply general matching logic for other types of problems
    
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
   * STRICT DETERMINATION: Is this a driving-related drill
   */
  private isDrivingDrill(): boolean {
    // STRICT CATEGORY CHECK - highest priority indicator
    if (this.drillText.includes('category: driving') || 
        this.drillText.includes('category:"driving"') ||
        this.drillText.includes('category: "driving"') ||
        this.drillText.includes('category:driving') ||
        this.drillText.includes('category: tee') ||
        this.drillText.includes('category:"tee')) {
      return true;
    }
    
    // Check for driving terms in title - strong indicator
    if (this.drillText.includes('title:') && 
        (this.drillText.split('title:')[1].includes('driv') || 
         this.drillText.split('title:')[1].includes('tee') ||
         this.drillText.split('title:')[1].includes('slice') ||
         this.drillText.split('title:')[1].includes('hook'))) {
      return true;
    }
    
    // Check for driving terms in focus areas
    if (this.drillText.includes('focus:') && 
        (this.drillText.split('focus:')[1].includes('driver') || 
         this.drillText.split('focus:')[1].includes('tee') ||
         this.drillText.split('focus:')[1].includes('slice'))) {
      return true;
    }
    
    // General checks for driving keywords - comprehensive
    const drivingTerms = ['driver', 'tee shot', 'off the tee', 'slice', 'hook', 'draw', 'fade', 'swing path'];
    let drivingTermCount = 0;
    
    for (const term of drivingTerms) {
      if (this.drillText.includes(term)) {
        drivingTermCount++;
      }
    }
    
    // STRICT EXCLUSION: Exclude drills with strong non-driving indicators
    if (this.drillText.includes('putt') || 
        this.drillText.includes('chip') || 
        this.drillText.includes('sand') ||
        this.drillText.includes('bunker')) {
      return false;
    }
    
    return drivingTermCount >= 2; // Require at least 2 driving terms
  }
  
  /**
   * STRICT DETERMINATION: Is this an iron play-related drill
   */
  private isIronDrill(): boolean {
    // STRICT CATEGORY CHECK
    if (this.drillText.includes('category: iron') || 
        this.drillText.includes('category:"iron"') ||
        this.drillText.includes('category: "iron"') ||
        this.drillText.includes('category:iron') ||
        this.drillText.includes('category: approach') ||
        this.drillText.includes('category:"approach"')) {
      return true;
    }
    
    // Check for iron terms in title
    if (this.drillText.includes('title:') && 
        (this.drillText.split('title:')[1].includes('iron') || 
         this.drillText.split('title:')[1].includes('approach') ||
         this.drillText.split('title:')[1].includes('ball striking') ||
         this.drillText.split('title:')[1].includes('contact'))) {
      return true;
    }
    
    // Check for iron terms in focus areas
    if (this.drillText.includes('focus:') && 
        (this.drillText.split('focus:')[1].includes('iron') || 
         this.drillText.split('focus:')[1].includes('approach') ||
         this.drillText.split('focus:')[1].includes('strike'))) {
      return true;
    }
    
    // General checks for iron keywords
    const ironTerms = ['iron', 'approach', 'ball striking', 'contact', 'compress', 'divot', 'fairway'];
    let ironTermCount = 0;
    
    for (const term of ironTerms) {
      if (this.drillText.includes(term)) {
        ironTermCount++;
      }
    }
    
    // Exclude drills with strong non-iron indicators
    if (this.drillText.includes('putt') || 
        this.drillText.includes('bunker') ||
        this.drillText.includes('chip') ||
        this.drillText.includes('green reading')) {
      return false;
    }
    
    return ironTermCount >= 2; // Require at least 2 iron terms
  }
  
  /**
   * STRICT DETERMINATION: Is this a chipping/short game drill
   */
  private isChippingDrill(): boolean {
    // STRICT CATEGORY CHECK
    if (this.drillText.includes('category: chip') || 
        this.drillText.includes('category:"chip"') ||
        this.drillText.includes('category: "chip"') ||
        this.drillText.includes('category:chip') ||
        this.drillText.includes('category: short game') ||
        this.drillText.includes('category:"short game"') ||
        this.drillText.includes('category: pitch') ||
        this.drillText.includes('category:"pitch"')) {
      return true;
    }
    
    // Check for chipping terms in title
    if (this.drillText.includes('title:') && 
        (this.drillText.split('title:')[1].includes('chip') || 
         this.drillText.split('title:')[1].includes('pitch') ||
         this.drillText.split('title:')[1].includes('short game') ||
         this.drillText.split('title:')[1].includes('around the green'))) {
      return true;
    }
    
    // Check for chipping terms in focus areas
    if (this.drillText.includes('focus:') && 
        (this.drillText.split('focus:')[1].includes('chip') || 
         this.drillText.split('focus:')[1].includes('short game') ||
         this.drillText.split('focus:')[1].includes('pitch'))) {
      return true;
    }
    
    // General checks for chipping keywords
    const chippingTerms = ['chip', 'pitch', 'short game', 'around the green', 'wedge', 'lob', 'flop'];
    let chippingTermCount = 0;
    
    for (const term of chippingTerms) {
      if (this.drillText.includes(term)) {
        chippingTermCount++;
      }
    }
    
    // Exclude drills with strong non-chipping indicators
    if (this.drillText.includes('putt') || 
        this.drillText.includes('driver') ||
        this.drillText.includes('full swing')) {
      return false;
    }
    
    return chippingTermCount >= 1; // Require at least 1 chipping term (they're quite specific)
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
