
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
      console.log("No challenges or problem provided to selector");
      return null;
    }

    const normalizedProblem = this.problem.toLowerCase();
    let bestMatch = null;
    let highestScore = -1;
    
    console.log(`Selecting challenge for problem: ${this.problem}`);
    console.log(`Problem category: ${this.category?.name || 'Unknown'}`);
    
    // Set minimum threshold based on problem type
    let minimumThreshold = 0.3;
    if (normalizedProblem.includes('putt')) {
      minimumThreshold = 0.2; // Lower threshold for putting to ensure we match something
    }

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

      // Specific keyword matches
      if (normalizedProblem.includes('putt') && 
          (challengeText.includes('putt') || challenge.category?.toLowerCase() === 'putting')) {
        score += 10; // Heavy priority for putting challenges when problem is putting-related
      }
      
      if (normalizedProblem.includes('driv') && 
          (challengeText.includes('driv') || challenge.category?.toLowerCase() === 'driving')) {
        score += 10;
      }
      
      if ((normalizedProblem.includes('chip') || normalizedProblem.includes('short game')) && 
          (challengeText.includes('chip') || challenge.category?.toLowerCase() === 'short game')) {
        score += 10;
      }

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

      console.log(`Challenge: "${challenge.title}" - Score: ${score}`);

      // Update best match if this is the highest score so far
      if (score > highestScore) {
        highestScore = score;
        bestMatch = challenge;
      }
    }

    console.log(`Best match: ${bestMatch?.title || 'None'} with score ${highestScore}`);

    // Return the best matching challenge or null if no good matches
    return highestScore > minimumThreshold ? bestMatch : null;
  }
}
