
/**
 * Class responsible for selecting appropriate challenges based on user problems
 */
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
      return null;
    }

    const normalizedProblem = this.problem.toLowerCase();
    let bestMatch = null;
    let highestScore = -1;

    // For each challenge, calculate a relevance score
    for (const challenge of challenges) {
      // Skip any undefined or empty challenges
      if (!challenge || !challenge.title) continue;

      const challengeText = [
        challenge.title?.toLowerCase() || '',
        challenge.description?.toLowerCase() || '',
        challenge.category?.toLowerCase() || '',
        challenge.Focus?.toLowerCase() || ''
      ].join(' ');

      // Calculate a relevance score
      let score = 0;

      // Category match is a strong signal
      if (this.category && challenge.category && 
          challenge.category.toLowerCase() === this.category.name.toLowerCase()) {
        score += 10;
      }

      // Problem keyword matches
      const problemWords = normalizedProblem
        .split(/\s+/)
        .filter(w => w.length > 3)
        .map(w => w.toLowerCase());
      
      for (const word of problemWords) {
        if (challengeText.includes(word)) {
          score += 2;
        }
      }

      // Adjust score based on handicap level match
      if (this.handicapLevel && challenge.difficulty) {
        if (challenge.difficulty.toLowerCase() === this.handicapLevel.toLowerCase()) {
          score += 5; // Significant boost for matching difficulty
        } else if (
          (this.handicapLevel === 'beginner' && challenge.difficulty.toLowerCase() === 'novice') ||
          (this.handicapLevel === 'novice' && 
            (challenge.difficulty.toLowerCase() === 'beginner' || challenge.difficulty.toLowerCase() === 'intermediate')) ||
          (this.handicapLevel === 'intermediate' && 
            (challenge.difficulty.toLowerCase() === 'novice' || challenge.difficulty.toLowerCase() === 'advanced')) ||
          (this.handicapLevel === 'advanced' && 
            (challenge.difficulty.toLowerCase() === 'intermediate' || challenge.difficulty.toLowerCase() === 'expert')) ||
          (this.handicapLevel === 'expert' && 
            (challenge.difficulty.toLowerCase() === 'advanced' || challenge.difficulty.toLowerCase() === 'pro')) ||
          (this.handicapLevel === 'pro' && challenge.difficulty.toLowerCase() === 'expert')
        ) {
          score += 3; // Boost for adjacent difficulty levels
        }
      }

      // Update best match if this is the highest score so far
      if (score > highestScore) {
        highestScore = score;
        bestMatch = challenge;
      }
    }

    // Return the best matching challenge or null if no good matches
    return highestScore > 5 ? bestMatch : null;
  }
}
