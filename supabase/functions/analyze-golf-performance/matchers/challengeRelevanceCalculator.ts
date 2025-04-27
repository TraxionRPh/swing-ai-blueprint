
import { ProblemCategory, validateContextMatch } from '../golfCategorization.ts';

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
      return 0; // Immediate rejection if context doesn't match
    }
    
    let score = 0;

    if (this.problemCategory) {
      score += this.calculateMetricMatchScore();
      score += this.calculateKeywordMatchScore(challengeText);
      score += this.calculateClubMatchScore(challengeText);
    }

    score += this.calculateCategorySpecificScore(challengeText);
    score += this.calculateTitleAndMetricMatchScore();
    score += this.calculateDefaultChallengeScore(challengeText);
    
    // Check instruction relevance - highly important
    score += this.calculateInstructionRelevanceScore();

    // Specific problem match scoring with enhanced precision
    score += this.calculateProblemSpecificScore(challengeText);
    
    // Check for compound matches (multiple related terms)
    score += this.calculateCompoundTermScore(challengeText);

    return Math.min(score, 1);
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
  
  private calculateInstructionRelevanceScore(): number {
    let score = 0;
    const problemTerms = this.specificProblem
      .split(/\s+/)
      .filter(term => term.length > 3)
      .map(term => term.toLowerCase());
    
    // Check each instruction for relevance to the problem
    if (this.challenge.instruction1) {
      const instruction = this.challenge.instruction1.toLowerCase();
      for (const term of problemTerms) {
        if (instruction.includes(term)) {
          score += 0.2;
          break;
        }
      }
    }
    
    if (this.challenge.instruction2) {
      const instruction = this.challenge.instruction2.toLowerCase();
      for (const term of problemTerms) {
        if (instruction.includes(term)) {
          score += 0.15;
          break;
        }
      }
    }
    
    if (this.challenge.instruction3) {
      const instruction = this.challenge.instruction3.toLowerCase();
      for (const term of problemTerms) {
        if (instruction.includes(term)) {
          score += 0.1;
          break;
        }
      }
    }
    
    return score;
  }
  
  private calculateCompoundTermScore(challengeText: string): number {
    // Define groups of related terms for different problem areas
    const termGroups = [
      // Putting terms
      ['putt', 'green', 'hole', 'line', 'speed'],
      // Bunker terms
      ['bunker', 'sand', 'explosion', 'splash'],
      // Slice terms
      ['slice', 'path', 'outside', 'face', 'alignment'],
      // Contact terms
      ['contact', 'strike', 'weight', 'posture', 'position']
    ];
    
    let score = 0;
    
    // Find the most relevant group for this problem
    let bestGroupMatches = 0;
    let relevantGroupIndex = -1;
    
    for (let i = 0; i < termGroups.length; i++) {
      const group = termGroups[i];
      const problemMatches = group.filter(term => this.specificProblem.includes(term)).length;
      
      if (problemMatches > bestGroupMatches) {
        bestGroupMatches = problemMatches;
        relevantGroupIndex = i;
      }
    }
    
    // If we found a relevant group, check how many terms match in the challenge
    if (relevantGroupIndex >= 0) {
      const relevantGroup = termGroups[relevantGroupIndex];
      const challengeMatches = relevantGroup.filter(term => challengeText.includes(term)).length;
      
      // More matches = stronger contextual relevance
      if (challengeMatches >= 3) {
        score += 0.4;
      } else if (challengeMatches >= 2) {
        score += 0.2;
      }
    }
    
    return score;
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

  private calculateDefaultChallengeScore(challengeText: string): number {
    if (this.calculateTitleAndMetricMatchScore() === 0 && 
        (challengeText.includes('general') || 
         challengeText.includes('basic') || 
         challengeText.includes('standard'))) {
      return 0.2;
    }
    return 0;
  }
  
  private calculateProblemSpecificScore(challengeText: string): number {
    let score = 0;
    
    // Specific match for topping the ball problems
    if (this.specificProblem.includes('topping') || 
        this.specificProblem.includes('top') || 
        this.specificProblem.includes('thin')) {
      if (challengeText.includes('contact') || 
          challengeText.includes('strike') || 
          challengeText.includes('ball first') || 
          challengeText.includes('divot')) {
        score += 0.7;  // Strong boost for topping challenges
      }
      
      // Check for direct terminology match
      if (challengeText.includes('top') || challengeText.includes('thin')) {
        score += 0.5;
      }
    }
    
    // Specific match for putting problems
    else if (this.specificProblem.includes('putt')) {
      // Check specific putting problem types
      if (this.specificProblem.includes('lag') && challengeText.includes('lag')) {
        score += 0.6;
      } else if (this.specificProblem.includes('short') && challengeText.includes('short')) {
        score += 0.6;
      } else if (this.specificProblem.includes('read') && challengeText.includes('read')) {
        score += 0.6;
      }
      
      // Penalize non-putting elements
      if (challengeText.includes('driver') || challengeText.includes('iron play')) {
        score -= 0.8;
      }
    }
    
    // Specific match for bunker problems
    else if (this.specificProblem.includes('bunker') || this.specificProblem.includes('sand')) {
      if (challengeText.includes('bunker') || challengeText.includes('sand')) {
        score += 0.8;
      }
      
      // Penalize non-bunker elements
      if (challengeText.includes('putt') || challengeText.includes('driver')) {
        score -= 0.8;
      }
    }
    
    // Specific match for slice problems
    else if (this.specificProblem.includes('slice')) {
      if (challengeText.includes('slice') || 
          challengeText.includes('path') || 
          challengeText.includes('face')) {
        score += 0.6;
      }
      
      // Check for solution terms
      if (challengeText.includes('draw') || challengeText.includes('inside')) {
        score += 0.4;
      }
    }
    
    return score;
  }
}
