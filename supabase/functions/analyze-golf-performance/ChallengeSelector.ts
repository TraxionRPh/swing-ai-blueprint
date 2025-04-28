
/**
 * Class responsible for selecting appropriate challenges based on user problems
 */
import { identifySubcategory, validateContextMatch } from './golfCategorization.ts';

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
   * and skill level with enhanced relevance matching
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
    
    // Higher thresholds for better specificity
    let minimumThreshold = 0.5; // Increased from previous values
    
    // Special handling for bunker problems - lower threshold for more flexibility
    if (normalizedProblem.includes('bunker') || normalizedProblem.includes('sand')) {
      console.log("Bunker problem detected - using more flexible matching");
      minimumThreshold = 0.3; // Lower threshold for bunker problems to ensure we find something
    }
    // Lower threshold slightly only for specific cases where we need more flexibility
    else if (normalizedProblem.includes('putt') || 
        normalizedProblem.includes('chip')) {
      minimumThreshold = 0.4;
    }

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

      // Special case for bunker challenges to bypass context match check
      const isBunkerProblem = normalizedProblem.includes('bunker') || normalizedProblem.includes('sand');
      const isBunkerChallenge = challengeText.includes('bunker') || challengeText.includes('sand');
      
      let contextValid = validateContextMatch(challengeText, this.problem, this.category);
      
      // Override context validation for bunker challenges if needed
      if (isBunkerProblem && isBunkerChallenge) {
        contextValid = true;
        console.log(`Force validating bunker challenge context for: ${challenge.title}`);
      }

      if (!contextValid) {
        // Skip this challenge as it doesn't match the required context
        continue;
      }

      let score = 0;

      // Special handling for bunker challenges
      if (normalizedProblem.includes('bunker') || normalizedProblem.includes('sand')) {
        // Give a big boost to bunker challenges for bunker problems
        if (challengeText.includes('bunker') || challengeText.includes('sand')) {
          score += 15; // Significant boost
          console.log(`💯 Bunker match found for challenge: ${challenge.title}`);
        } else {
          continue; // Skip non-bunker challenges for bunker problems
        }
        score += this.calculateBunkerChallengeScore(challengeText, normalizedProblem);
      }
      // Special handling for putting challenges
      else if (normalizedProblem.includes('putt')) {
        if (!challengeText.includes('putt') && !challengeText.includes('green')) {
          continue; // Skip non-putting challenges for putting problems
        }
        score += this.calculatePuttingChallengeScore(challengeText, normalizedProblem);
      }
      // Special handling for topping/thin hit challenges
      else if (normalizedProblem.includes('top') || normalizedProblem.includes('thin')) {
        score += this.calculateContactChallengeScore(challengeText, normalizedProblem);
      }
      // General challenge scoring
      else {
        score += this.calculateGeneralChallengeScore(challengeText, normalizedProblem);
      }

      // Adjust score based on difficulty match
      score += this.calculateDifficultyMatchScore(challenge);
      
      // Strong boost for matching subcategory
      if (subcategory && challengeText.includes(subcategory)) {
        score += 4; // Increased from 3
      }
      
      // Check instruction relevance - highly important
      score += this.calculateInstructionRelevanceScore(challenge, normalizedProblem);

      console.log(`Challenge: "${challenge.title}" - Score: ${score}`);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = challenge;
      }
    }

    console.log(`Best match: ${bestMatch?.title || 'None'} with score ${highestScore}`);

    // Require a higher minimum threshold for better specificity
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
      score += 4; // Increased from 3
    } else if ((problem.includes('short') || problem.includes('3 foot')) && 
               challengeText.includes('short')) {
      score += 4; // Increased from 3
    } else if ((problem.includes('read') || problem.includes('break')) && 
               (challengeText.includes('read') || challengeText.includes('break'))) {
      score += 4; // New specific match
    }
    
    // Instruction validation
    if (challengeText.includes('stroke') || 
        challengeText.includes('line') || 
        challengeText.includes('speed')) {
      score += 2;
    }
    
    // Penalty for non-putting elements
    if (challengeText.includes('driver') || 
        challengeText.includes('iron') || 
        challengeText.includes('chip') ||
        challengeText.includes('bunker')) {
      score -= 5; // Strong penalty for irrelevant content
    }
    
    return score;
  }

  private calculateBunkerChallengeScore(challengeText: string, problem: string): number {
    let score = 0;
    
    // Core bunker context validation - highly important!
    if (challengeText.includes('bunker') || challengeText.includes('sand')) {
      score += 10; // Increased significantly for bunker problems
      
      // Check for additional specific bunker terms
      const bunkerTerms = [
        'explosion', 'splash', 'sand shot', 'trap', 'rake', 
        'greenside bunker', 'fairway bunker', 'open face', 'sand wedge'
      ];
      
      for (const term of bunkerTerms) {
        if (challengeText.includes(term)) {
          score += 3;
          console.log(`Bunker term match in challenge: ${term}`);
        }
      }
    }
    
    // Validate actual bunker focus in instructions - critical!
    if ((challengeText.includes('instruction') || challengeText.includes('step')) && 
        (challengeText.includes('bunker') || challengeText.includes('sand'))) {
      score += 6; // Very important that instructions specifically mention bunker/sand
      console.log(`Bunker-specific instructions found in challenge`);
    }
    
    // Check if title explicitly mentions bunker
    if ((challengeText.includes('title') || challenge.title) && 
        (challengeText.includes('bunker') || challengeText.includes('sand'))) {
      score += 8;
      console.log(`Bunker mentioned in challenge title`);
    }
    
    // Check if category explicitly mentions bunker
    if ((challengeText.includes('category') || challenge.category) && 
        (challengeText.includes('bunker') || challengeText.includes('sand'))) {
      score += 5;
      console.log(`Bunker mentioned in challenge category`);
    }
    
    // Penalize challenges focusing on non-bunker aspects
    if (challengeText.includes('fringe') || 
        challengeText.includes('fairway') || 
        challengeText.includes('green') ||
        challengeText.includes('putt') ||
        challengeText.includes('driver')) {
      score -= 4; // Increased from 2
    }
    
    return score;
  }
  
  private calculateContactChallengeScore(challengeText: string, problem: string): number {
    let score = 0;
    
    // Core contact problem validation
    if (challengeText.includes('contact') || 
        challengeText.includes('strike') ||
        challengeText.includes('ball position')) {
      score += 5;
    }
    
    // Validate specific contact skills in instructions
    if (challengeText.includes('weight') || 
        challengeText.includes('posture') || 
        challengeText.includes('divot') ||
        challengeText.includes('compression')) {
      score += 4;
    }
    
    // Check specific terminology match
    if ((problem.includes('top') && challengeText.includes('top')) ||
        (problem.includes('thin') && challengeText.includes('thin'))) {
      score += 3;
    }
    
    // Penalize irrelevant aspects
    if (challengeText.includes('putt') || 
        challengeText.includes('bunker') || 
        challengeText.includes('chip')) {
      score -= 4;
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
    
    // Check for compound term matches (multiple related terms appearing together)
    const compoundMatches = this.checkCompoundTermMatches(challengeText, problem);
    score += compoundMatches * 3;
    
    return score;
  }
  
  private checkCompoundTermMatches(challengeText: string, problem: string): number {
    // Define groups of related terms
    const termGroups = [
      ['slice', 'path', 'face', 'alignment'],
      ['hook', 'path', 'grip', 'clubface'],
      ['distance', 'carry', 'yardage', 'power'],
      ['direction', 'aim', 'target', 'alignment'],
      ['chip', 'pitch', 'around', 'green'],
      ['contact', 'strike', 'compression', 'ball first'],
      ['bunker', 'sand', 'explosion', 'splash', 'sand wedge', 'trap'] // Extended bunker-specific group
    ];
    
    let compoundMatches = 0;
    
    for (const group of termGroups) {
      // Check if problem contains any term from group
      const problemHasTerm = group.some(term => problem.includes(term));
      
      if (problemHasTerm) {
        // Count how many terms from this group appear in the challenge
        const matchCount = group.filter(term => challengeText.includes(term)).length;
        
        // If multiple terms from the same group appear, it's a strong contextual match
        if (matchCount >= 2) {
          compoundMatches++;
        }
      }
    }
    
    return compoundMatches;
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
  
  private calculateInstructionRelevanceScore(challenge: any, problem: string): number {
    let score = 0;
    let relevantInstructions = 0;
    
    // Check if instructions specifically address the problem
    if (challenge.instruction1) {
      const instruction = challenge.instruction1.toLowerCase();
      if (this.isInstructionRelevant(instruction, problem)) {
        score += 2;
        relevantInstructions++;
      }
      
      // Extra points for bunker-related instructions
      if ((problem.includes('bunker') || problem.includes('sand')) && 
          (instruction.includes('bunker') || instruction.includes('sand'))) {
        score += 3;
        console.log(`Bunker mentioned in instruction1: ${challenge.instruction1}`);
      }
    }
    
    if (challenge.instruction2) {
      const instruction = challenge.instruction2.toLowerCase();
      if (this.isInstructionRelevant(instruction, problem)) {
        score += 2;
        relevantInstructions++;
      }
      
      // Extra points for bunker-related instructions
      if ((problem.includes('bunker') || problem.includes('sand')) && 
          (instruction.includes('bunker') || instruction.includes('sand'))) {
        score += 2;
        console.log(`Bunker mentioned in instruction2: ${challenge.instruction2}`);
      }
    }
    
    if (challenge.instruction3) {
      const instruction = challenge.instruction3.toLowerCase();
      if (this.isInstructionRelevant(instruction, problem)) {
        score += 2;
        relevantInstructions++;
      }
      
      // Extra points for bunker-related instructions
      if ((problem.includes('bunker') || problem.includes('sand')) && 
          (instruction.includes('bunker') || instruction.includes('sand'))) {
        score += 2;
        console.log(`Bunker mentioned in instruction3: ${challenge.instruction3}`);
      }
    }
    
    // If all instructions are relevant, give extra boost
    if (relevantInstructions >= 3) {
      score += 3; // Strong bonus for comprehensive relevance
    }
    
    return score;
  }
  
  private isInstructionRelevant(instruction: string, problem: string): boolean {
    // Extract key problem terms
    const problemTerms = problem
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);
      
    // Special case for bunker problems
    if (problem.includes('bunker') || problem.includes('sand')) {
      return instruction.includes('bunker') || instruction.includes('sand');
    }
    
    // Check if any problem term appears in the instruction
    return problemTerms.some(term => instruction.includes(term));
  }
}
