
import { ProblemCategory } from '../golfCategorization.ts';

export class DrillRelevanceCalculator {
  private drillText: string;
  private searchTerms: string[];
  private specificProblem: string;
  private problemCategory?: ProblemCategory | null;

  constructor(
    drillText: string,
    searchTerms: string[],
    specificProblem: string,
    problemCategory?: ProblemCategory | null
  ) {
    this.drillText = typeof drillText === 'string' ? drillText.toLowerCase() : '';
    this.searchTerms = searchTerms;
    this.specificProblem = specificProblem.toLowerCase();
    this.problemCategory = problemCategory;
  }

  calculateScore(): number {
    if (!this.drillText || !this.searchTerms.length) {
      return 0;
    }

    let score = 0;

    // Core category matching with increased weight (most important factor)
    if (this.problemCategory) {
      score += this.calculateCategoryBasedScore() * 1.5; // Increased weight
      score += this.calculateProblemSpecificBonus();
      score += this.calculateClubRelevanceBonus();
      score += this.calculateFundamentalsBonus();
      
      // Apply category penalty for mismatches
      score -= this.calculateCategoryPenalty();
    }

    // Term matching with adjusted weight
    score += this.calculateTermMatchingScore() * 0.8;
    
    // Problem-specific handling
    if (this.specificProblem.includes('putt')) {
      score += this.calculatePuttingSpecificScore();
    } else if (this.specificProblem.includes('topping') || this.specificProblem.includes('thin') || this.specificProblem.includes('top')) {
      score += this.calculateToppingSpecificScore();
    }

    // Ensure final score is within [0,1] range
    return Math.min(Math.max(score, 0), 1);
  }

  private calculateCategoryBasedScore(): number {
    let score = 0;
    if (!this.problemCategory) return score;

    // Category-based scoring with increased weight for fundamentals
    for (const keyword of this.problemCategory.keywords) {
      if (this.drillText.includes(keyword)) {
        score += 0.25; // Increased from 0.2
      }
    }
    
    // Boost for direct category match
    if (this.problemCategory.name.toLowerCase() === 'putting' && 
        this.drillText.includes('putting')) {
      score += 0.4; // Strong boost for putting category match
    } else if (this.drillText.includes(this.problemCategory.name.toLowerCase())) {
      score += 0.3; // Good boost for other category matches
    }

    return score;
  }
  
  private calculateCategoryPenalty(): number {
    // Apply penalties for category mismatches
    let penalty = 0;
    
    // Putting problem but non-putting drill
    if (this.specificProblem.includes('putt') && 
        this.problemCategory?.name.toLowerCase() === 'putting') {
      
      // Check for strong indicators of non-putting drills
      const nonPuttingTerms = ['driver', 'iron', 'chip', 'pitch', 'bunker', 'sand', 'tee shot'];
      for (const term of nonPuttingTerms) {
        if (this.drillText.includes(term)) {
          penalty += 0.3;
          break;
        }
      }
      
      // Extra penalty for wrong category
      if (this.drillText.includes('category')) {
        const wrongCategories = ['driving', 'iron play', 'short game', 'bunker'];
        for (const category of wrongCategories) {
          if (this.drillText.includes(category)) {
            penalty += 0.5; // Strong penalty for wrong category
            break;
          }
        }
      }
    }
    
    // For driving problems, penalize putting drills
    if ((this.specificProblem.includes('driv') || this.specificProblem.includes('slice') || 
         this.specificProblem.includes('hook')) && 
        (this.drillText.includes('putt') || this.drillText.includes('green'))) {
      penalty += 0.4;
    }
    
    // For iron problems, penalize putting drills
    if ((this.specificProblem.includes('iron') || this.specificProblem.includes('approach')) && 
        (this.drillText.includes('putt') || this.drillText.includes('green reading'))) {
      penalty += 0.3;
    }
    
    return penalty;
  }

  private calculateProblemSpecificBonus(): number {
    let score = 0;
    const lowerProblem = this.specificProblem;

    if (lowerProblem.includes('putt')) {
      score += this.calculatePuttingScore();
    } else if (lowerProblem.includes('top') || lowerProblem.includes('topping')) {
      score += this.calculateToppingScore();
    } else if (lowerProblem.includes('chunk') || lowerProblem.includes('fat')) {
      score += this.calculateChunkingScore();
    } else if (lowerProblem.includes('slice') || lowerProblem.includes('push')) {
      score += this.calculateSlicingScore();
    } else if (lowerProblem.includes('chip') || lowerProblem.includes('pitch')) {
      score += this.calculateShortGameScore();
    }

    return score;
  }

  private calculatePuttingScore(): number {
    let score = 0;
    
    // Direct category and term matches
    if (this.drillText.includes('category') && this.drillText.includes('putting')) {
      score += 0.7; // Very strong boost for putting category
    }
    
    // Strong putting indicators
    const puttingTerms = [
      'putt', 'putting', 'green', 'hole', 'cup'
    ];
    
    for (const term of puttingTerms) {
      if (this.drillText.includes(term)) {
        score += 0.4;
        break; // Only count once
      }
    }
    
    // Specific putting skills
    const puttingSkills = [
      'speed control', 'distance control', 'green reading',
      'stroke path', 'alignment', 'lag', 'make percentage'
    ];
    
    for (const skill of puttingSkills) {
      if (this.drillText.includes(skill)) {
        score += 0.3;
      }
    }
    
    // Penalize inappropriate drills
    if (
      this.drillText.includes('driver') ||
      this.drillText.includes('iron') ||
      this.drillText.includes('chips') ||
      this.drillText.includes('bunker') ||
      this.drillText.includes('sand')
    ) {
      score -= 0.5;
    }

    return score;
  }
  
  private calculatePuttingSpecificScore(): number {
    let score = 0;
    
    // Explicit putting terms
    if (
      this.drillText.includes('putt') ||
      this.drillText.includes('green') ||
      this.drillText.includes('hole')
    ) {
      score += 0.5;  // Direct match to problem
    }
    
    // Specific putting skills
    if (
      this.drillText.includes('speed control') ||
      this.drillText.includes('distance control') ||
      this.drillText.includes('green reading') ||
      this.drillText.includes('lag') ||
      this.drillText.includes('alignment')
    ) {
      score += 0.6;  // Highly relevant to putting
    }
    
    // Penalize non-putting drills
    if (
      this.drillText.includes('driver') ||
      this.drillText.includes('chip') ||
      this.drillText.includes('iron play') ||
      this.drillText.includes('bunker')
    ) {
      score -= 0.8;  // Strong penalty for wrong area
    }
    
    return score;
  }
  
  private calculateShortGameScore(): number {
    let score = 0;
    
    if (
      this.drillText.includes('chip') ||
      this.drillText.includes('pitch') ||
      this.drillText.includes('wedge') ||
      this.drillText.includes('short game') ||
      this.drillText.includes('around the green')
    ) {
      score += 0.5;
    }
    
    // Penalize putting-only drills
    if (
      (this.drillText.includes('putt') || this.drillText.includes('green reading')) &&
      !this.drillText.includes('chip') && 
      !this.drillText.includes('pitch')
    ) {
      score -= 0.4;
    }
    
    return score;
  }

  private calculateToppingScore(): number {
    let score = 0;
    
    // Prioritize drills focused on fixing topping issues
    if (
      this.drillText.includes('weight transfer') ||
      this.drillText.includes('impact position') ||
      this.drillText.includes('ball position') ||
      this.drillText.includes('strike down') ||
      this.drillText.includes('compression') ||
      this.drillText.includes('downward angle') ||
      this.drillText.includes('knockdown') ||
      this.drillText.includes('spin') ||
      this.drillText.includes('divot') ||
      this.drillText.includes('posture')
    ) {
      score += 0.5;
    }

    // Penalize inappropriate drills
    if (
      this.drillText.includes('downhill') ||
      this.drillText.includes('uphill') ||
      this.drillText.includes('uneven') ||
      this.drillText.includes('bunker') ||
      this.drillText.includes('rough') ||
      this.drillText.includes('flop') ||
      this.drillText.includes('pitch')
    ) {
      score -= 0.5;
    }

    return score;
  }
  
  private calculateToppingSpecificScore(): number {
    let score = 0;
    
    // Even more specific scoring for topping problems
    if (
      this.drillText.includes('top') ||
      this.drillText.includes('thin')
    ) {
      score += 0.5;  // Direct match to problem
    }
    
    if (
      this.drillText.includes('ball-first contact') ||
      this.drillText.includes('ball first contact') ||
      this.drillText.includes('clean contact')
    ) {
      score += 0.7;  // Highly relevant to solution
    }
    
    if (
      this.drillText.includes('posture') &&
      (this.drillText.includes('maintain') || this.drillText.includes('keeping'))
    ) {
      score += 0.6;  // Very relevant technique focus
    }
    
    return score;
  }

  private calculateChunkingScore(): number {
    let score = 0;
    
    if (
      this.drillText.includes('low point') ||
      this.drillText.includes('weight forward') ||
      this.drillText.includes('ball first') ||
      this.drillText.includes('divot after') ||
      this.drillText.includes('compression') ||
      this.drillText.includes('strike down')
    ) {
      score += 0.5;
    }

    if (
      this.drillText.includes('flop') ||
      this.drillText.includes('pitch') ||
      this.drillText.includes('uneven')
    ) {
      score -= 0.4;
    }

    return score;
  }

  private calculateSlicingScore(): number {
    let score = 0;
    
    if (
      this.drillText.includes('path') ||
      this.drillText.includes('face control') ||
      this.drillText.includes('release') ||
      this.drillText.includes('rotation') ||
      this.drillText.includes('inside') ||
      this.drillText.includes('draw') ||
      this.drillText.includes('turn through')
    ) {
      score += 0.5;
    }

    if (
      this.drillText.includes('chip') ||
      this.drillText.includes('pitch') ||
      this.drillText.includes('putting')
    ) {
      score -= 0.6; // Increased penalty
    }

    return score;
  }

  private calculateClubRelevanceBonus(): number {
    let score = 0;
    if (!this.problemCategory) return score;

    for (const club of this.problemCategory.relatedClubs) {
      if (this.drillText.includes(club)) {
        score += 0.3; // Increased from 0.25
      }
    }

    return score;
  }

  private calculateFundamentalsBonus(): number {
    if (
      this.drillText.includes('fundamental') ||
      this.drillText.includes('basic') ||
      this.drillText.includes('foundation')
    ) {
      return 0.15;
    }
    return 0;
  }

  private calculateTermMatchingScore(): number {
    let score = 0;
    for (const term of this.searchTerms) {
      if (term.length > 2 && this.drillText.includes(term)) {
        score += 0.15; // Increased from 0.1
      }
    }
    return score;
  }
}
