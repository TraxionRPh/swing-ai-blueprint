
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

    // Core fundamentals matching
    if (this.problemCategory) {
      score += this.calculateCategoryBasedScore();
      score += this.calculateProblemSpecificBonus();
      score += this.calculateClubRelevanceBonus();
      score += this.calculateFundamentalsBonus();
    }

    // Base term matching with reduced weight
    score += this.calculateTermMatchingScore();

    return Math.min(Math.max(score, 0), 1);
  }

  private calculateCategoryBasedScore(): number {
    let score = 0;
    if (!this.problemCategory) return score;

    // Category-based scoring with increased weight for fundamentals
    for (const keyword of this.problemCategory.keywords) {
      if (this.drillText.includes(keyword)) {
        score += 0.2;
      }
    }

    return score;
  }

  private calculateProblemSpecificBonus(): number {
    let score = 0;
    const lowerProblem = this.specificProblem;

    if (lowerProblem.includes('top') || lowerProblem.includes('topping')) {
      score += this.calculateToppingScore();
    } else if (lowerProblem.includes('chunk') || lowerProblem.includes('fat')) {
      score += this.calculateChunkingScore();
    } else if (lowerProblem.includes('slice') || lowerProblem.includes('push')) {
      score += this.calculateSlicingScore();
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
      this.drillText.includes('divot')
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
      score -= 0.4;
    }

    return score;
  }

  private calculateClubRelevanceBonus(): number {
    let score = 0;
    if (!this.problemCategory) return score;

    for (const club of this.problemCategory.relatedClubs) {
      if (this.drillText.includes(club)) {
        score += 0.25;
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
        score += 0.1;
      }
    }
    return score;
  }
}
