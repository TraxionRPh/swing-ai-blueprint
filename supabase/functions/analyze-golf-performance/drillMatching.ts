
import { ProblemCategory } from './golfCategorization.ts';
import { DrillRelevanceCalculator } from './matchers/drillRelevanceCalculator.ts';
import { ChallengeRelevanceCalculator } from './matchers/challengeRelevanceCalculator.ts';

export function getDrillRelevanceScore(
  drillText: string, 
  searchTerms: string[], 
  specificProblem: string,
  problemCategory?: ProblemCategory | null
): number {
  const calculator = new DrillRelevanceCalculator(drillText, searchTerms, specificProblem, problemCategory);
  return calculator.calculateScore();
}

export function getChallengeRelevanceScore(
  challenge: any,
  specificProblem: string,
  problemCategory?: ProblemCategory | null
): number {
  const calculator = new ChallengeRelevanceCalculator(challenge, specificProblem, problemCategory);
  return calculator.calculateScore();
}

// Enhanced function to better identify putting-related drills with strict matching
export function isPuttingRelated(drill: any): boolean {
  if (!drill) return false;
  
  // Direct category check (strongest indicator)
  if (drill.category?.toLowerCase() === 'putting') {
    return true;
  }
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(drill.focus?.map((f: string) => f.toLowerCase()) || [])
  ].join(' ');
  
  // Primary putting indicators (strong signals)
  const primaryPuttingTerms = [
    'putt', 'putting', 'putter', 'green', 'hole', 'cup', 'lag'
  ];
  
  // Check for obvious putting terms
  for (const term of primaryPuttingTerms) {
    if (drillText.includes(term)) {
      return true;
    }
  }
  
  // Secondary putting indicators (require additional context)
  const secondaryPuttingTerms = [
    'speed', 'stroke', 'line', 'read', 'roll', 'distance control'
  ];
  
  // For secondary terms, require multiple matches or specific combinations
  let secondaryMatches = 0;
  for (const term of secondaryPuttingTerms) {
    if (drillText.includes(term)) {
      secondaryMatches++;
    }
  }
  
  return secondaryMatches >= 2;
}

// Strong negative indicators that a drill is NOT putting related
export function isDefinitelyNotPuttingRelated(drill: any): boolean {
  if (!drill) return true;
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(drill.focus?.map((f: string) => f.toLowerCase()) || [])
  ].join(' ');
  
  // These categories and terms strongly indicate non-putting drills
  const nonPuttingIndicators = [
    'drive', 'driver', 'tee shot', 'bunker', 'sand', 
    'chip', 'chipping', 'pitch', 'pitching', 'wedge play',
    'full swing', 'iron', 'fairway'
  ];
  
  // Check category directly first (most reliable)
  if (drill.category && 
      ['driving', 'long game', 'bunker', 'sand', 'chipping', 'pitching']
        .includes(drill.category.toLowerCase())) {
    return true;
  }
  
  // Look for strong indicators in title (next most reliable)
  for (const term of nonPuttingIndicators) {
    if (drill.title?.toLowerCase().includes(term)) {
      return true;
    }
  }
  
  // Count indicators in full text
  let nonPuttingMatches = 0;
  for (const term of nonPuttingIndicators) {
    if (drillText.includes(term)) {
      nonPuttingMatches++;
    }
  }
  
  // Multiple non-putting terms is a strong signal
  return nonPuttingMatches >= 2;
}

// Determine if a drill is relevant to a specific problem with stricter matching
export function isDrillRelevantToProblem(drill: any, problem: string): boolean {
  if (!drill || !problem) return false;
  
  const problemLower = problem.toLowerCase();
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(drill.focus?.map((f: string) => f.toLowerCase()) || [])
  ].join(' ');
  
  // Special handling for putting problems - strict filtering
  if (problemLower.includes('putt') || 
      problemLower.includes('green') || 
      problemLower.includes('lag') ||
      problemLower.includes('speed on the green')) {
    
    // For putting problems, strictly check that it's not a non-putting drill
    if (isDefinitelyNotPuttingRelated(drill)) {
      return false;
    }
    
    // And verify it is putting-related
    return isPuttingRelated(drill);
  }
  
  // Special handling for driving/slicing problems
  if (problemLower.includes('slice') || 
      problemLower.includes('hook') || 
      problemLower.includes('driver') || 
      problemLower.includes('off the tee') || 
      problemLower.includes('tee shot')) {
    
    if (drill.category?.toLowerCase() === 'putting' || drillText.includes('putt')) {
      return false; // Putting drills aren't relevant for driving problems
    }
    
    return drillText.includes('driver') || 
           drillText.includes('tee') || 
           drillText.includes('slice') || 
           drillText.includes('hook') ||
           drillText.includes('path');
  }
  
  // Special handling for topping/thin hitting problems
  if (problemLower.includes('top') || 
      problemLower.includes('thin') || 
      problemLower.includes('fat') || 
      problemLower.includes('chunk')) {
    
    if (drill.category?.toLowerCase() === 'putting' || drillText.includes('putt')) {
      return false; // Putting drills aren't relevant for strike problems
    }
    
    return drillText.includes('contact') || 
           drillText.includes('strike') || 
           drillText.includes('compress') || 
           drillText.includes('impact') ||
           drillText.includes('position');
  }
  
  // Special handling for short game problems
  if (problemLower.includes('chip') || 
      problemLower.includes('pitch') || 
      problemLower.includes('short game')) {
    
    if (drill.category?.toLowerCase() === 'putting' || drillText.includes('putt')) {
      return false; // Putting drills aren't directly relevant for short game
    }
    
    if (drillText.includes('driver') || drillText.includes('tee shot')) {
      return false; // Driver drills aren't relevant for short game
    }
    
    return drillText.includes('chip') || 
           drillText.includes('pitch') || 
           drillText.includes('wedge') || 
           drillText.includes('short game');
  }
  
  // General relevance check - stronger keyword matching
  const problemKeywords = problemLower
    .split(/\s+/)
    .filter(word => word.length > 3 && !['with', 'the', 'and', 'for', 'golf'].includes(word));
  
  // Require at least one key problem term to match  
  let hasKeyTermMatch = false;
  for (const keyword of problemKeywords) {
    if (drillText.includes(keyword)) {
      hasKeyTermMatch = true;
      break;
    }
  }
  
  return hasKeyTermMatch;
}
