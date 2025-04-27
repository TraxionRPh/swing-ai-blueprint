import { ProblemCategory, identifyProblemCategory } from './golfCategorization.ts';

/**
 * Calculate a relevance score for a drill based on how well it matches the search terms
 * and specific problem. Higher scores indicate better matches.
 * 
 * @param drillText Combined text representation of the drill
 * @param searchTerms Array of search terms from the specific problem
 * @param specificProblem The full specific problem text
 * @param problemCategory Optional problem category for enhanced matching
 * @returns A relevance score between 0 and 1
 */
export function getDrillRelevanceScore(
  drillText: string, 
  searchTerms: string[], 
  specificProblem: string,
  problemCategory?: ProblemCategory | null
): number {
  const lowerDrillText = typeof drillText === 'string' ? drillText.toLowerCase() : '';
  const lowerProblem = specificProblem.toLowerCase();
  
  if (!lowerDrillText || !searchTerms.length) {
    return 0;
  }
  
  let score = 0;
  
  // Core fundamentals matching
  if (problemCategory) {
    // Specific issue-based scoring
    if (lowerProblem.includes('top') || lowerProblem.includes('topping')) {
      // For topping issues, prioritize drills focused on:
      // - Ball position
      // - Weight transfer
      // - Downward strike
      // - Impact position
      if (
        lowerDrillText.includes('weight transfer') ||
        lowerDrillText.includes('impact position') ||
        lowerDrillText.includes('ball position') ||
        lowerDrillText.includes('strike down') ||
        lowerDrillText.includes('compression') ||
        lowerDrillText.includes('downward angle')
      ) {
        score += 0.4;
      }
      
      // Penalize drills that aren't directly helpful
      if (
        lowerDrillText.includes('downhill') ||
        lowerDrillText.includes('uphill') ||
        lowerDrillText.includes('uneven') ||
        lowerDrillText.includes('bunker')
      ) {
        score -= 0.3;
      }
    }
    
    if (lowerProblem.includes('chunk') || lowerProblem.includes('fat')) {
      // For chunking issues, prioritize drills focused on:
      // - Low point control
      // - Weight forward
      // - Ball first contact
      if (
        lowerDrillText.includes('low point') ||
        lowerDrillText.includes('weight forward') ||
        lowerDrillText.includes('ball first') ||
        lowerDrillText.includes('divot after')
      ) {
        score += 0.4;
      }
    }
    
    if (lowerProblem.includes('slice') || lowerProblem.includes('push')) {
      // For slice issues, prioritize drills focused on:
      // - Path correction
      // - Face control
      // - Release pattern
      if (
        lowerDrillText.includes('path') ||
        lowerDrillText.includes('face control') ||
        lowerDrillText.includes('release') ||
        lowerDrillText.includes('rotation')
      ) {
        score += 0.4;
      }
    }
    
    // Category-based scoring
    for (const keyword of problemCategory.keywords) {
      if (lowerDrillText.includes(keyword)) {
        score += 0.15;
      }
    }
    
    // Club-based relevance
    for (const club of problemCategory.relatedClubs) {
      if (lowerDrillText.includes(club)) {
        score += 0.2;
      }
    }
  }
  
  // Base term matching with reduced weight
  for (const term of searchTerms) {
    if (term.length > 2 && lowerDrillText.includes(term)) {
      score += 0.1; // Reduced from 0.2 to give more weight to specific issue matching
    }
  }
  
  // Ensure the drill complexity matches the problem
  if (lowerDrillText.includes('basic') || lowerDrillText.includes('fundamental')) {
    score += 0.1; // Slight boost for fundamental drills
  }
  
  // Penalize overly complex drills for basic issues
  if (lowerProblem.includes('basic') || lowerProblem.includes('beginner')) {
    if (lowerDrillText.includes('advanced') || lowerDrillText.includes('complex')) {
      score -= 0.2;
    }
  }

  return Math.min(Math.max(score, 0), 1); // Ensure score stays between 0 and 1
}

/**
 * Calculate a relevance score for a challenge based on how well it matches
 * the specific problem being addressed.
 * 
 * @param challenge The challenge to evaluate
 * @param specificProblem The specific problem being addressed
 * @param problemCategory Optional problem category for enhanced matching
 * @returns A relevance score between 0 and 1
 */
export function getChallengeRelevanceScore(
  challenge: any,
  specificProblem: string,
  problemCategory?: ProblemCategory | null
): number {
  if (!challenge || !specificProblem) {
    return 0;
  }

  const lowerProblem = specificProblem.toLowerCase();
  
  // Combine all relevant challenge fields into a single string for matching
  const challengeFields = [
    challenge.title || '',
    challenge.description || '',
    challenge.category || '',
    challenge.metric || '',
    ...(Array.isArray(challenge.metrics) ? challenge.metrics.filter(Boolean) : [])
  ].filter(Boolean);
  
  const lowerChallenge = challengeFields.join(' ').toLowerCase();

  let score = 0;

  // Enhanced matching based on problem category
  if (problemCategory) {
    // Check if the challenge matches the primary outcome metric for this category
    for (const metric of problemCategory.outcomeMetrics) {
      if (challenge.metric?.toLowerCase() === metric.toLowerCase() ||
          (Array.isArray(challenge.metrics) && 
           challenge.metrics.some(m => m?.toLowerCase() === metric.toLowerCase()))) {
        score += 0.5;
        break;
      }
    }
    
    // Check if challenge matches any keywords from the category
    for (const keyword of problemCategory.keywords) {
      if (lowerChallenge.includes(keyword)) {
        score += 0.1;
      }
    }
    
    // Check if challenge matches any related clubs from the category
    for (const club of problemCategory.relatedClubs) {
      if (lowerChallenge.includes(club)) {
        score += 0.15;
      }
    }
  }

  // Original category-specific matching logic
  const category = problemCategory?.name.toLowerCase() || '';
  
  if (category === "ball striking") {
    if (
      lowerChallenge.includes('green') || 
      lowerChallenge.includes('approach') ||
      lowerChallenge.includes('iron') ||
      lowerChallenge.includes('gir') ||
      lowerChallenge.includes('regulation')
    ) {
      score += 0.6;
    }
  }
  else if (category === "driving accuracy") {
    if (
      lowerChallenge.includes('fairway') || 
      lowerChallenge.includes('accuracy') ||
      lowerChallenge.includes('driving') ||
      lowerChallenge.includes('direction')
    ) {
      score += 0.5;
    }
  } else if (category === "putting") {
    if (
      lowerChallenge.includes('putt') || 
      lowerChallenge.includes('putts') ||
      lowerChallenge.includes('green')
    ) {
      score += 0.5;
    }
  } else if (category === "short game") {
    if (
      lowerChallenge.includes('chip') || 
      lowerChallenge.includes('up and down') ||
      lowerChallenge.includes('short game')
    ) {
      score += 0.5;
    }
  }

  // Match categories
  if (challenge.category?.toLowerCase().includes(lowerProblem.split(' ')[0])) {
    score += 0.3;
  }

  // Match metrics to problem
  if (Array.isArray(challenge.metrics)) {
    for (const metric of challenge.metrics) {
      if (typeof metric === 'string' && lowerProblem.includes(metric.toLowerCase())) {
        score += 0.2;
        break;
      }
    }
  }

  // Additional scoring for title matches
  if (challenge.title?.toLowerCase().includes(lowerProblem)) {
    score += 0.4;
  }

  // If no specific match but has a default/general challenge
  if (score === 0 && 
    (lowerChallenge.includes('general') || 
     lowerChallenge.includes('basic') || 
     lowerChallenge.includes('standard'))) {
    score += 0.2;
  }

  return Math.min(score, 1);
}
