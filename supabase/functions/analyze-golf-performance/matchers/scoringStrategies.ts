
/**
 * Scoring strategies for different types of golf challenges
 */
import { ProblemCategory } from '../golfCategorization.ts';

interface ScoringContext {
  challengeText: string;
  specificProblem: string;
  problemCategory?: ProblemCategory | null;
  challenge: any;
}

/**
 * Calculate score for bunker-specific challenges
 */
export function calculateBunkerScore(context: ScoringContext): number {
  const { challengeText, specificProblem, challenge } = context;
  let score = 0;
  
  // Core bunker validation
  if (challengeText.includes('bunker') || challengeText.includes('sand')) {
    score += 10; 
    
    // Specific bunker terms boost
    const bunkerTerms = [
      'explosion', 'splash', 'sand shot', 'trap', 'rake', 
      'greenside bunker', 'fairway bunker', 'open face', 'sand wedge'
    ];
    
    for (const term of bunkerTerms) {
      if (challengeText.includes(term)) {
        score += 3;
      }
    }
  }
  
  // Check specific instruction focus
  if (challenge.instruction1 && 
      (challenge.instruction1.toLowerCase().includes('bunker') || 
       challenge.instruction1.toLowerCase().includes('sand'))) {
    score += 5;
  }
  
  if (challenge.instruction2 && 
      (challenge.instruction2.toLowerCase().includes('bunker') || 
       challenge.instruction2.toLowerCase().includes('sand'))) {
    score += 3;
  }
  
  if (challenge.instruction3 && 
      (challenge.instruction3.toLowerCase().includes('bunker') || 
       challenge.instruction3.toLowerCase().includes('sand'))) {
    score += 2;
  }
  
  // Check for title and category matches
  if (challenge.title && 
      (challenge.title.toLowerCase().includes('bunker') || 
       challenge.title.toLowerCase().includes('sand'))) {
    score += 8;
  }
  
  if (challenge.category && 
      (challenge.category.toLowerCase().includes('bunker') || 
       challenge.category.toLowerCase().includes('sand'))) {
    score += 5;
  }
  
  // Penalize non-bunker elements
  if (challengeText.includes('putt') || challengeText.includes('driver')) {
    score -= 8;
  }
  
  return score;
}

/**
 * Calculate score for putting-specific challenges
 */
export function calculatePuttingScore(context: ScoringContext): number {
  const { challengeText, specificProblem } = context;
  let score = 0;
  
  // Core putting context validation
  if (challengeText.includes('putt') || challengeText.includes('green')) {
    score += 8;
  }
  
  // Specific putting type matching
  if (specificProblem.includes('lag') && challengeText.includes('lag')) {
    score += 6;
  } else if ((specificProblem.includes('short') || specificProblem.includes('3 foot')) && 
             challengeText.includes('short')) {
    score += 6;
  } else if ((specificProblem.includes('read') || specificProblem.includes('break')) && 
             (challengeText.includes('read') || challengeText.includes('break'))) {
    score += 6;
  }
  
  // Instruction validation
  if (challengeText.includes('stroke') || 
      challengeText.includes('line') || 
      challengeText.includes('speed')) {
    score += 4;
  }
  
  // Penalize non-putting elements
  if (challengeText.includes('driver') || 
      challengeText.includes('iron') || 
      challengeText.includes('bunker')) {
    score -= 8;
  }
  
  return score;
}

/**
 * Calculate score for contact/ball-striking challenges
 */
export function calculateContactScore(context: ScoringContext): number {
  const { challengeText, specificProblem } = context;
  let score = 0;
  
  // Core contact validation
  if (challengeText.includes('contact') || 
      challengeText.includes('strike') ||
      challengeText.includes('ball position')) {
    score += 7;
  }
  
  // Specific technique terms
  if (challengeText.includes('weight') || 
      challengeText.includes('posture') || 
      challengeText.includes('divot') ||
      challengeText.includes('compression')) {
    score += 5;
  }
  
  // Check specific terminology match
  if ((specificProblem.includes('top') && challengeText.includes('top')) ||
      (specificProblem.includes('thin') && challengeText.includes('thin'))) {
    score += 6;
  }
  
  return score;
}

/**
 * Calculate general scoring for challenges
 */
export function calculateGeneralScore(context: ScoringContext): number {
  const { challengeText, specificProblem, problemCategory } = context;
  let score = 0;
  
  // Match problem keywords
  const problemWords = specificProblem
    .split(/\s+/)
    .filter(w => w.length > 3)
    .map(w => w.toLowerCase());
  
  for (const word of problemWords) {
    if (challengeText.includes(word)) {
      score += 2;
    }
  }
  
  // Category alignment
  if (problemCategory && challengeText.includes(problemCategory.name.toLowerCase())) {
    score += 3;
  }
  
  return score;
}

/**
 * Calculate score for instruction relevance
 */
export function calculateInstructionRelevanceScore(context: ScoringContext): number {
  const { specificProblem, challenge } = context;
  let score = 0;
  
  // Return 0 if there are no instructions
  if (!challenge) return 0;
  
  const problemTerms = specificProblem
    .split(/\s+/)
    .filter(term => term.length > 3)
    .map(term => term.toLowerCase());
  
  // Check each instruction for relevance
  const instructions = [
    challenge.instruction1, 
    challenge.instruction2, 
    challenge.instruction3
  ].filter(Boolean).map(i => i.toLowerCase());
  
  let relevantInstructions = 0;
  
  for (const instruction of instructions) {
    for (const term of problemTerms) {
      if (instruction.includes(term)) {
        score += 2;
        relevantInstructions++;
        break;
      }
    }
    
    // Special case for bunker problems
    if ((specificProblem.includes('bunker') || specificProblem.includes('sand')) && 
        (instruction.includes('bunker') || instruction.includes('sand'))) {
      score += 3;
    }
  }
  
  // Bonus for having multiple relevant instructions
  if (relevantInstructions >= 2) {
    score += 3;
  }
  
  return score;
}

/**
 * Check for compound term matches (related terms appearing together)
 */
export function checkCompoundTermMatches(challengeText: string, problem: string): number {
  // Define groups of related terms
  const termGroups = [
    ['slice', 'path', 'face', 'alignment'],
    ['hook', 'path', 'grip', 'clubface'],
    ['distance', 'carry', 'yardage', 'power'],
    ['direction', 'aim', 'target', 'alignment'],
    ['chip', 'pitch', 'around', 'green'],
    ['contact', 'strike', 'compression', 'ball first'],
    ['bunker', 'sand', 'explosion', 'splash', 'sand wedge', 'trap']
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
