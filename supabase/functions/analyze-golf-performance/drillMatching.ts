import { ProblemCategory, validateContextMatch } from './golfCategorization.ts';
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
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
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
  
  // Require at least 2 secondary terms to confirm putting context
  return secondaryMatches >= 2;
}

// Function to identify driving-related drills
export function isDrivingRelated(drill: any): boolean {
  if (!drill) return false;
  
  // Direct category check (strongest indicator)
  if (drill.category?.toLowerCase() === 'driving' || 
      drill.category?.toLowerCase().includes('tee shot')) {
    return true;
  }
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
  ].join(' ');
  
  // Primary driving indicators
  const primaryDrivingTerms = [
    'driver', 'tee shot', 'off the tee', 'slice', 'hook'
  ];
  
  // Check for obvious driving terms
  for (const term of primaryDrivingTerms) {
    if (drillText.includes(term)) {
      return true;
    }
  }
  
  // Secondary driving indicators
  const secondaryDrivingTerms = [
    'swing path', 'face angle', 'draw', 'fade', 'long game'
  ];
  
  // For secondary terms, require multiple matches
  let secondaryMatches = 0;
  for (const term of secondaryDrivingTerms) {
    if (drillText.includes(term)) {
      secondaryMatches++;
    }
  }
  
  return secondaryMatches >= 2;
}

// Function to identify iron play drills
export function isIronPlayRelated(drill: any): boolean {
  if (!drill) return false;
  
  // Direct category check
  if (drill.category?.toLowerCase() === 'iron play' || 
      drill.category?.toLowerCase().includes('approach') ||
      drill.category?.toLowerCase().includes('ball striking')) {
    return true;
  }
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
  ].join(' ');
  
  // Primary iron play indicators
  const primaryIronTerms = [
    'iron', 'approach', 'ball striking', 'contact', 'compress'
  ];
  
  // Check for obvious iron terms
  for (const term of primaryIronTerms) {
    if (drillText.includes(term)) {
      return true;
    }
  }
  
  // Secondary iron play indicators
  const secondaryIronTerms = [
    'divot', 'trajectory', 'fairway', 'strike', 'turf'
  ];
  
  // For secondary terms, require multiple matches
  let secondaryMatches = 0;
  for (const term of secondaryIronTerms) {
    if (drillText.includes(term)) {
      secondaryMatches++;
    }
  }
  
  return secondaryMatches >= 2;
}

// Function to identify chipping/short game drills
export function isChippingRelated(drill: any): boolean {
  if (!drill) return false;
  
  // Direct category check
  if (drill.category?.toLowerCase() === 'short game' || 
      drill.category?.toLowerCase().includes('chip') ||
      drill.category?.toLowerCase().includes('pitch')) {
    return true;
  }
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
  ].join(' ');
  
  // Primary chipping indicators
  const primaryChippingTerms = [
    'chip', 'pitch', 'short game', 'around the green', 'wedge'
  ];
  
  // Check for obvious chipping terms
  for (const term of primaryChippingTerms) {
    if (drillText.includes(term)) {
      return true;
    }
  }
  
  // Secondary chipping indicators
  const secondaryChippingTerms = [
    'lob', 'flop', 'up and down', 'landing spot', 'roll out'
  ];
  
  // For secondary terms, require multiple matches
  let secondaryMatches = 0;
  for (const term of secondaryChippingTerms) {
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
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
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

// Strong negative indicators for driving drills
export function isDefinitelyNotDrivingRelated(drill: any): boolean {
  if (!drill) return true;
  
  // Check category directly first (most reliable)
  if (drill.category && 
      ['putting', 'short game', 'bunker', 'sand', 'chipping', 'pitching']
        .includes(drill.category.toLowerCase())) {
    return true;
  }
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
  ].join(' ');
  
  // These terms strongly indicate non-driving drills
  const nonDrivingIndicators = [
    'putt', 'green', 'chip', 'pitch', 'bunker', 'sand', 'short game'
  ];
  
  // Look for strong indicators in title
  for (const term of nonDrivingIndicators) {
    if (drill.title?.toLowerCase().includes(term)) {
      return true;
    }
  }
  
  // Count indicators in full text
  let nonDrivingMatches = 0;
  for (const term of nonDrivingIndicators) {
    if (drillText.includes(term)) {
      nonDrivingMatches++;
    }
  }
  
  return nonDrivingMatches >= 2;
}

// Enhanced function for bunker-related drills with improved detection
export function isBunkerRelated(drill: any): boolean {
  if (!drill) return false;
  
  // Direct category check - highest priority indicator
  if (drill.category?.toLowerCase().includes('bunker') || 
      drill.category?.toLowerCase().includes('sand')) {
    return true;
  }
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
  ].join(' ');
  
  // Primary bunker indicators - strong signals
  const primaryBunkerTerms = [
    'bunker', 'sand', 'trap', 'explosion', 'splash'
  ];
  
  // Check for obvious bunker terms in title first (most reliable location)
  for (const term of primaryBunkerTerms) {
    if (drill.title?.toLowerCase().includes(term)) {
      return true;
    }
  }
  
  // Secondary bunker terms that need additional context
  const secondaryBunkerTerms = [
    'wedge', 'lob', 'open face', 'sand wedge'
  ];
  
  // Count primary bunker terms in full text
  let primaryMatches = 0;
  for (const term of primaryBunkerTerms) {
    if (drillText.includes(term)) {
      primaryMatches++;
    }
  }
  
  // Even one primary term anywhere is a good signal
  if (primaryMatches > 0) {
    return true;
  }
  
  // For secondary terms, require multiple matches or specific combinations
  let secondaryMatches = 0;
  for (const term of secondaryBunkerTerms) {
    if (drillText.includes(term)) {
      secondaryMatches++;
    }
  }
  
  // Require at least 2 secondary terms to confirm bunker context
  return secondaryMatches >= 2;
}

// Function to check if a drill is related to topping/thin hits
export function isContactRelated(drill: any): boolean {
  if (!drill) return false;
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
  ].join(' ');
  
  // Contact-related terms
  const contactTerms = [
    'contact', 'strike', 'thin', 'top', 'compression', 
    'ball position', 'posture', 'weight transfer'
  ];
  
  // Check title first (most important)
  for (const term of contactTerms) {
    if (drill.title?.toLowerCase().includes(term)) {
      return true;
    }
  }
  
  // Count contact terms in full text
  let contactMatches = 0;
  for (const term of contactTerms) {
    if (drillText.includes(term)) {
      contactMatches++;
    }
  }
  
  // Multiple contact terms is a strong signal
  return contactMatches >= 2;
}

// Determine if a drill is relevant to a specific problem with stricter matching
export function isDrillRelevantToProblem(drill: any, problem: string, category?: ProblemCategory): boolean {
  if (!drill || !problem) return false;
  
  // Ensure drill has basic fields to avoid errors
  if (!drill.id || !drill.title) {
    console.log("Warning: Drill is missing required fields", drill);
    return false;
  }
  
  const problemLower = problem.toLowerCase();
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
  ].join(' ');
  
  // Use the context validator if we have a category
  if (category) {
    return validateContextMatch(drillText, problem, category);
  }
  
  // STRICT CATEGORY-BASED FILTERING
  
  // Putting problems - strict category enforcement
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
  
  // Driving problems - strict category enforcement
  if (problemLower.includes('driv') || 
      problemLower.includes('tee shot') || 
      problemLower.includes('off the tee') ||
      problemLower.includes('slice') ||
      problemLower.includes('hook')) {
    
    // For driving problems, strictly check that it's not a non-driving drill
    if (isDefinitelyNotDrivingRelated(drill)) {
      return false;
    }
    
    // And verify it is driving-related
    return isDrivingRelated(drill);
  }
  
  // Iron problems - strict category enforcement
  if (problemLower.includes('iron') || 
      problemLower.includes('approach') || 
      problemLower.includes('ball striking') ||
      problemLower.includes('contact')) {
    
    return isIronPlayRelated(drill);
  }
  
  // Chipping/short game problems - strict category enforcement
  if (problemLower.includes('chip') || 
      problemLower.includes('pitch') || 
      problemLower.includes('short game') ||
      problemLower.includes('around the green')) {
    
    return isChippingRelated(drill);
  }
  
  // Bunker/sand problems - strict category enforcement
  if (problemLower.includes('bunker') || 
      problemLower.includes('sand') || 
      problemLower.includes('trap')) {
    
    // First, check exclusions - a bunker drill should not be a putting drill
    if (isPuttingRelated(drill)) {
      return false;
    }
    
    // Then verify it is specifically bunker-related
    return isBunkerRelated(drill);
  }
  
  // Special handling for topping/thin hitting problems
  if (problemLower.includes('top') || 
      problemLower.includes('thin') || 
      problemLower.includes('fat') || 
      problemLower.includes('chunk')) {
    
    if (drill.category?.toLowerCase() === 'putting' || drillText.includes('putt')) {
      return false; // Putting drills aren't relevant for strike problems
    }
    
    return isContactRelated(drill) || 
           drillText.includes('contact') || 
           drillText.includes('strike') || 
           drillText.includes('compress') || 
           drillText.includes('impact') ||
           drillText.includes('position');
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

// Helper function to check if multiple related terms appear together
export function hasCompoundTerms(text: string, termSets: string[][]): boolean {
  for (const termSet of termSets) {
    let matchCount = 0;
    for (const term of termSet) {
      if (text.includes(term)) {
        matchCount++;
      }
    }
    if (matchCount >= 2) {
      return true;
    }
  }
  return false;
}

// New function to detect if a drill is specifically a fairway bunker drill
export function isFairwayBunkerDrill(drill: any): boolean {
  if (!drill) return false;
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
  ].join(' ');
  
  // Check for direct fairway bunker mentions
  return drillText.includes('fairway bunker') || 
         (drillText.includes('fairway') && 
          (drillText.includes('bunker') || drillText.includes('sand')));
}

// New function to detect if a drill is specifically a greenside bunker drill
export function isGreensideBunkerDrill(drill: any): boolean {
  if (!drill) return false;
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(Array.isArray(drill.focus) ? drill.focus.map((f: string) => f.toLowerCase()) : [])
  ].join(' ');
  
  // Check for greenside bunker indicators
  return drillText.includes('greenside bunker') || 
         drillText.includes('green side bunker') ||
         drillText.includes('sand save') ||
         drillText.includes('explosion shot') ||
         ((drillText.includes('bunker') || drillText.includes('sand')) && 
          (drillText.includes('greenside') || 
           drillText.includes('green side') || 
           drillText.includes('around the green')));
}

// New function to check if a drill matches specific bunker problem types
export function matchesBunkerProblemType(drill: any, problem: string): boolean {
  if (!drill || !drill.id || !drill.title) {
    console.log("Warning: Invalid drill in matchesBunkerProblemType", drill);
    return false;
  }
  
  const problemLower = problem.toLowerCase();
  
  // For fairway bunker specific problems
  if (problemLower.includes('fairway bunker')) {
    return isFairwayBunkerDrill(drill);
  }
  
  // For greenside bunker specific problems
  if (problemLower.includes('greenside bunker') || 
      problemLower.includes('green side bunker') ||
      (problemLower.includes('bunker') && 
       (problemLower.includes('chip') || 
        problemLower.includes('short game')))) {
    return isGreensideBunkerDrill(drill);
  }
  
  // Generic bunker problem - any bunker drill is acceptable
  return isBunkerRelated(drill);
}
