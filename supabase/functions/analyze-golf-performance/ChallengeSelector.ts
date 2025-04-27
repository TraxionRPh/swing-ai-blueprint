
/**
 * Class responsible for selecting appropriate challenges based on user problems
 */
import { identifySubcategory } from './golfCategorization.ts';

export class ChallengeSelector {
  private problem: string;
  private category: any;
  private handicapLevel: string | undefined;

  constructor(problem: string, category: any, handicapLevel?: string) {
    this.problem = problem || '';
    this.category = category;
    this.handicapLevel = handicapLevel;
  }

  /**
   * Select the most appropriate challenge based on the user's problem
   * and skill level
   */
  selectChallenge(challenges: any[]): any {
    if (!this.problem || !challenges || challenges.length === 0) {
      console.log("No challenges or problem provided to selector");
      return null;
    }

    const normalizedProblem = this.problem.toLowerCase();
    let bestMatch = null;
    let highestScore = -1;
    
    console.log(`Selecting challenge for problem: ${this.problem}`);
    console.log(`Problem category: ${this.category?.name || 'Unknown'}`);
    
    // Get the subcategory for more specific matching
    const subcategory = this.category ? 
      identifySubcategory(this.problem, this.category) : null;
    
    console.log(`Identified subcategory: ${subcategory || 'None'}`);
    
    // Lower threshold for putting/bunker problems to ensure matches
    let minimumThreshold = normalizedProblem.includes('putt') || 
                          normalizedProblem.includes('bunker') ? 0.2 : 0.3;

    // For each challenge, calculate a relevance score with stricter context matching
    for (const challenge of challenges) {
      if (!challenge || !challenge.title) continue;

      const challengeText = [
        challenge.title?.toLowerCase() || '',
        challenge.description?.toLowerCase() || '',
        challenge.category?.toLowerCase() || '',
        challenge.instruction1?.toLowerCase() || '',
        challenge.instruction2?.toLowerCase() || '',
        challenge.instruction3?.toLowerCase() || '',
      ].join(' ');

      let score = 0;

      // Special handling for putting challenges
      if (normalizedProblem.includes('putt')) {
        if (!challengeText.includes('putt') && !challengeText.includes('green')) {
          continue; // Skip non-putting challenges for putting problems
        }
        score += this.calculatePuttingChallengeScore(challengeText, normalizedProblem);
      }
      
      // Special handling for bunker challenges
      else if (normalizedProblem.includes('bunker') || normalizedProblem.includes('sand')) {
        if (!challengeText.includes('bunker') && !challengeText.includes('sand')) {
          continue; // Skip non-bunker challenges for bunker problems
        }
        score += this.calculateBunkerChallengeScore(challengeText, normalizedProblem);
      }
      
      // General challenge scoring
      else {
        score += this.calculateGeneralChallengeScore(challengeText, normalizedProblem);
      }

      // Adjust score based on difficulty match
      score += this.calculateDifficultyMatchScore(challenge);
      
      // Strong boost for matching subcategory
      if (subcategory && challengeText.includes(subcategory)) {
        score += 3;
      }

      console.log(`Challenge: "${challenge.title}" - Score: ${score}`);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = challenge;
      }
    }

    console.log(`Best match: ${bestMatch?.title || 'None'} with score ${highestScore}`);

    return highestScore > minimumThreshold ? bestMatch : null;
  }

  private calculatePuttingChallengeScore(challengeText: string, problem: string): number {
    let score = 0;
    
    // Core putting context validation
    if (challengeText.includes('putt') || challengeText.includes('green')) {
      score += 5;
    }
    
    // Specific putting type matching
    if (problem.includes('lag') && challengeText.includes('lag')) {
      score += 3;
    } else if ((problem.includes('short') || problem.includes('3 foot')) && 
               challengeText.includes('short')) {
      score += 3;
    }
    
    // Instruction validation
    if (challengeText.includes('stroke') || 
        challengeText.includes('line') || 
        challengeText.includes('speed')) {
      score += 2;
    }
    
    return score;
  }

  private calculateBunkerChallengeScore(challengeText: string, problem: string): number {
    let score = 0;
    
    // Core bunker context validation
    if (challengeText.includes('bunker') || challengeText.includes('sand')) {
      score += 5;
    }
    
    // Validate actual bunker focus in instructions
    if (challengeText.includes('explosion') || 
        challengeText.includes('splash') || 
        challengeText.includes('sand shot')) {
      score += 3;
    }
    
    // Penalize challenges focusing on non-bunker aspects
    if (challengeText.includes('fringe') || 
        challengeText.includes('fairway') || 
        challengeText.includes('green')) {
      score -= 2;
    }
    
    return score;
  }

  private calculateGeneralChallengeScore(challengeText: string, problem: string): number {
    let score = 0;
    
    // Match problem keywords
    const problemWords = problem
      .split(/\s+/)
      .filter(w => w.length > 3)
      .map(w => w.toLowerCase());
    
    for (const word of problemWords) {
      if (challengeText.includes(word)) {
        score += 2;
      }
    }
    
    // Category alignment
    if (this.category && challengeText.includes(this.category.name.toLowerCase())) {
      score += 3;
    }
    
    return score;
  }

  private calculateDifficultyMatchScore(challenge: any): number {
    if (!this.handicapLevel || !challenge.difficulty) return 0;
    
    if (challenge.difficulty.toLowerCase() === this.handicapLevel.toLowerCase()) {
      return 5; // Perfect difficulty match
    }
    
    // Adjacent difficulty levels get a smaller boost
    const difficultyLevels = ['beginner', 'novice', 'intermediate', 'advanced', 'expert'];
    const userIndex = difficultyLevels.indexOf(this.handicapLevel.toLowerCase());
    const challengeIndex = difficultyLevels.indexOf(challenge.difficulty.toLowerCase());
    
    if (userIndex !== -1 && challengeIndex !== -1 && Math.abs(userIndex - challengeIndex) === 1) {
      return 2; // Adjacent difficulty level
    }
    
    return 0;
  }
}
