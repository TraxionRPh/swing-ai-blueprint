
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
      score += this.calculateCategoryBasedScore() * 1.8; // Further increased weight
      score += this.calculateProblemSpecificBonus();
      score += this.calculateClubRelevanceBonus();
      score += this.calculateFundamentalsBonus();
      
      // Apply category penalty for mismatches
      score -= this.calculateCategoryPenalty();
    }

    // Term matching with adjusted weight
    score += this.calculateTermMatchingScore() * 1.2; // Increased from 0.8
    
    // Problem-specific handling with enhanced context validation
    if (this.specificProblem.includes('putt')) {
      score += this.calculatePuttingSpecificScore();
      
      // Apply strict context boundary - putting drills must have putting context
      if (!this.drillText.includes('putt') && 
          !this.drillText.includes('green') && 
          !this.drillText.includes('hole')) {
        score = 0; // Reset score if core context is missing
        return score;
      }
    } else if (this.specificProblem.includes('bunker') || this.specificProblem.includes('sand')) {
      score += this.calculateBunkerSpecificScore();
      
      // Apply strict context boundary - bunker drills must have bunker context
      if (!this.drillText.includes('bunker') && 
          !this.drillText.includes('sand')) {
        score = 0; // Reset score if core context is missing
        return score;
      }
    } else if (this.specificProblem.includes('topping') || this.specificProblem.includes('thin') || this.specificProblem.includes('top')) {
      score += this.calculateToppingSpecificScore();
    } else if (this.specificProblem.includes('slice')) {
      score += this.calculateSliceSpecificScore();
    }
    
    // Check for compound term matches (multiple related terms appearing together)
    score += this.calculateCompoundTermMatches() * 0.6;

    // Ensure final score is within [0,1] range
    return Math.min(Math.max(score, 0), 1);
  }

  private calculateCompoundTermMatches(): number {
    // Define groups of related terms
    const termGroups = [
      ['putt', 'green', 'hole', 'line', 'speed'],
      ['bunker', 'sand', 'explosion', 'splash'],
      ['slice', 'path', 'outside', 'face', 'grip'],
      ['hook', 'path', 'inside', 'face', 'grip'],
      ['chip', 'pitch', 'around', 'green', 'short'],
      ['top', 'thin', 'contact', 'position', 'weight']
    ];
    
    let compoundScore = 0;
    
    for (const group of termGroups) {
      // Count how many terms from this group appear in the drill
      const matchCount = group.filter(term => this.drillText.includes(term)).length;
      
      // Only count groups that match the problem
      const problemHasTerm = group.some(term => this.specificProblem.includes(term));
      
      // If multiple terms from the same group appear, it's a strong contextual match
      if (problemHasTerm && matchCount >= 3) {
        compoundScore += 0.5;
      } else if (problemHasTerm && matchCount >= 2) {
        compoundScore += 0.3;
      }
    }
    
    return compoundScore;
  }

  private calculateCategoryBasedScore(): number {
    let score = 0;
    if (!this.problemCategory) return score;

    // Category-based scoring with increased weight for fundamentals
    for (const keyword of this.problemCategory.keywords) {
      if (this.drillText.includes(keyword)) {
        score += 0.3; // Increased from 0.25
      }
    }
    
    // Boost for direct category match
    if (this.problemCategory.name.toLowerCase() === 'putting' && 
        this.drillText.includes('putting')) {
      score += 0.5; // Strong boost for putting category match
    } else if (this.drillText.includes(this.problemCategory.name.toLowerCase())) {
      score += 0.4; // Good boost for other category matches
    }
    
    // Check for required context
    if (this.problemCategory.requiredContext) {
      const contextMatches = this.problemCategory.requiredContext.filter(ctx => 
        this.drillText.includes(ctx)
      ).length;
      
      if (contextMatches > 0) {
        score += contextMatches * 0.3;
      }
    }
    
    // Check for primary context
    if (this.problemCategory.primaryContext) {
      const primaryMatches = this.problemCategory.primaryContext.filter(ctx => 
        this.drillText.includes(ctx)
      ).length;
      
      if (primaryMatches > 0) {
        score += primaryMatches * 0.4;
      }
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
          penalty += 0.6; // Increased from 0.3
          break;
        }
      }
      
      // Extra penalty for wrong category
      if (this.drillText.includes('category')) {
        const wrongCategories = ['driving', 'iron play', 'short game', 'bunker'];
        for (const category of wrongCategories) {
          if (this.drillText.includes(category)) {
            penalty += 0.8; // Increased from 0.5
            break;
          }
        }
      }
    }
    
    // For driving problems, penalize putting drills
    if ((this.specificProblem.includes('driv') || this.specificProblem.includes('slice') || 
         this.specificProblem.includes('hook')) && 
        (this.drillText.includes('putt') || this.drillText.includes('green'))) {
      penalty += 0.7; // Increased from 0.4
    }
    
    // For iron problems, penalize putting drills
    if ((this.specificProblem.includes('iron') || this.specificProblem.includes('approach')) && 
        (this.drillText.includes('putt') || this.drillText.includes('green reading'))) {
      penalty += 0.6; // Increased from 0.3
    }
    
    // Check for exclusion keywords
    if (this.problemCategory?.exclusionKeywords) {
      for (const exclusion of this.problemCategory.exclusionKeywords) {
        // If problem doesn't contain the exclusion but the drill does, it's a mismatch
        if (!this.specificProblem.includes(exclusion) && this.drillText.includes(exclusion)) {
          penalty += 0.4;
        }
      }
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
    
    // Distinguish types of putting problems
    if (this.specificProblem.includes('lag') && 
        (this.drillText.includes('lag') || this.drillText.includes('distance control'))) {
      score += 0.4;
    } else if (this.specificProblem.includes('short') && 
               (this.drillText.includes('short') || this.drillText.includes('3 foot'))) {
      score += 0.4;
    } else if (this.specificProblem.includes('read') && 
               (this.drillText.includes('read') || this.drillText.includes('break'))) {
      score += 0.4;
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
  
  private calculateBunkerSpecificScore(): number {
    let score = 0;
    
    // Explicit bunker terms
    if (
      this.drillText.includes('bunker') ||
      this.drillText.includes('sand') ||
      this.drillText.includes('trap')
    ) {
      score += 0.7;  // Direct match to problem
    }
    
    // Specific bunker skills
    if (
      this.drillText.includes('explosion') ||
      this.drillText.includes('splash') ||
      this.drillText.includes('sand shot') ||
      this.drillText.includes('open face')
    ) {
      score += 0.5;  // Highly relevant to bunker play
    }
    
    // Penalize non-bunker drills
    if (
      this.drillText.includes('driver') ||
      this.drillText.includes('putt') ||
      this.drillText.includes('full swing') ||
      (this.drillText.includes('chip') && !this.drillText.includes('sand'))
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
    
    // Specific short game techniques
    if (
      this.drillText.includes('bump and run') ||
      this.drillText.includes('flop') ||
      this.drillText.includes('lob') ||
      this.drillText.includes('high soft')
    ) {
      score += 0.3;
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
    
    // Multiple related terms appearing together
    let contactTermCount = 0;
    const contactTerms = ['contact', 'strike', 'compression', 'weight', 'posture', 'position'];
    for (const term of contactTerms) {
      if (this.drillText.includes(term)) {
        contactTermCount++;
      }
    }
    
    // Bonus for multiple related terms
    if (contactTermCount >= 3) {
      score += 0.4; // Strong contextual relevance
    } else if (contactTermCount >= 2) {
      score += 0.2;
    }
    
    return score;
  }
  
  private calculateSliceSpecificScore(): number {
    let score = 0;
    
    // Direct terms
    if (
      this.drillText.includes('slice') ||
      this.drillText.includes('outside-in') ||
      this.drillText.includes('path')
    ) {
      score += 0.6;
    }
    
    // Related mechanics
    if (
      this.drillText.includes('grip') ||
      this.drillText.includes('face angle') ||
      this.drillText.includes('clubface') ||
      this.drillText.includes('alignment') ||
      this.drillText.includes('shoulder')
    ) {
      score += 0.4;
    }
    
    // Corrections
    if (
      this.drillText.includes('draw') ||
      this.drillText.includes('inside') ||
      this.drillText.includes('square')
    ) {
      score += 0.3;
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

    // Multiple related terms appearing together
    let chunkTermCount = 0;
    const chunkTerms = ['fat', 'chunk', 'heavy', 'behind the ball', 'weight forward'];
    for (const term of chunkTerms) {
      if (this.drillText.includes(term)) {
        chunkTermCount++;
      }
    }
    
    // Bonus for multiple related terms
    if (chunkTermCount >= 2) {
      score += 0.4;
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
