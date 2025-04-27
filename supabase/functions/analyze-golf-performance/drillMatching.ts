
/**
 * Calculate a relevance score for a drill based on how well it matches the search terms
 * and specific problem. Higher scores indicate better matches.
 * 
 * @param drillText Combined text representation of the drill
 * @param searchTerms Array of search terms from the specific problem
 * @param specificProblem The full specific problem text
 * @returns A relevance score between 0 and 1
 */
export function getDrillRelevanceScore(
  drillText: string, 
  searchTerms: string[], 
  specificProblem: string
): number {
  // Convert to lowercase for case-insensitive matching
  const lowerDrillText = typeof drillText === 'string' ? drillText.toLowerCase() : '';
  const lowerProblem = specificProblem.toLowerCase();
  
  if (!lowerDrillText || !searchTerms.length) {
    return 0;
  }
  
  let score = 0;
  
  // Match specific problems with enhanced iron contact matching
  if (lowerProblem.includes('chunk') || lowerProblem.includes('iron contact') || 
      lowerProblem.includes('ball striking')) {
    if (
      lowerDrillText.includes('iron') || 
      lowerDrillText.includes('contact') || 
      lowerDrillText.includes('strike') ||
      lowerDrillText.includes('ball first') ||
      lowerDrillText.includes('compression') ||
      lowerDrillText.includes('impact') ||
      lowerDrillText.includes('ball position')
    ) {
      score += 0.5;
    }
  }
  else if (lowerProblem.includes('slice') || lowerProblem.includes('slicing')) {
    if (
      lowerDrillText.includes('slice') || 
      lowerDrillText.includes('path') || 
      lowerDrillText.includes('alignment') ||
      lowerDrillText.includes('outside-in') ||
      lowerDrillText.includes('over the top')
    ) {
      score += 0.4;
    }
    
    // Specific club relevance
    if (lowerProblem.includes('driver') && lowerDrillText.includes('driver')) {
      score += 0.3;
    }
  } else if (lowerProblem.includes('hook')) {
    if (
      lowerDrillText.includes('hook') || 
      lowerDrillText.includes('path') || 
      lowerDrillText.includes('inside-out')
    ) {
      score += 0.4;
    }
  } else if (lowerProblem.includes('putt') || lowerProblem.includes('putting')) {
    if (lowerDrillText.includes('putt') || lowerDrillText.includes('green')) {
      score += 0.5;
    }
  } else if (lowerProblem.includes('chip') || lowerProblem.includes('short game')) {
    if (lowerDrillText.includes('chip') || lowerDrillText.includes('short game')) {
      score += 0.5;
    }
  } else if (lowerProblem.includes('bunker') || lowerProblem.includes('sand')) {
    if (lowerDrillText.includes('bunker') || lowerDrillText.includes('sand')) {
      score += 0.5;
    }
  }
  
  // Direct term matching
  for (const term of searchTerms) {
    if (term.length > 2 && lowerDrillText.includes(term)) {
      score += 0.2;
    }
  }
  
  // Category matching (ensures drills match the general category)
  const categories = ['driving', 'irons', 'putting', 'chipping', 'bunker', 'wedge', 'short game'];
  
  for (const category of categories) {
    if (lowerProblem.includes(category) && lowerDrillText.includes(category)) {
      score += 0.3;
      break; // Only count category match once
    }
  }
  
  // Ensure score doesn't exceed 1
  return Math.min(score, 1);
}

/**
 * Calculate a relevance score for a challenge based on how well it matches
 * the specific problem being addressed.
 * 
 * @param challenge The challenge to evaluate
 * @param specificProblem The specific problem being addressed
 * @returns A relevance score between 0 and 1
 */
export function getChallengeRelevanceScore(
  challenge: any,
  specificProblem: string
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

  // Enhanced matching for iron contact/ball striking issues
  if (lowerProblem.includes('chunk') || lowerProblem.includes('iron contact') || 
      lowerProblem.includes('ball striking')) {
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
  // Match specific problems with relevant challenges
  else if (lowerProblem.includes('slice') || lowerProblem.includes('hook')) {
    if (
      lowerChallenge.includes('fairway') || 
      lowerChallenge.includes('accuracy') ||
      lowerChallenge.includes('driving') ||
      lowerChallenge.includes('direction')
    ) {
      score += 0.5;
    }
  } else if (lowerProblem.includes('putt') || lowerProblem.includes('putting')) {
    if (
      lowerChallenge.includes('putt') || 
      lowerChallenge.includes('putts') ||
      lowerChallenge.includes('green')
    ) {
      score += 0.5;
    }
  } else if (lowerProblem.includes('chip') || lowerProblem.includes('short game')) {
    if (
      lowerChallenge.includes('chip') || 
      lowerChallenge.includes('up and down') ||
      lowerChallenge.includes('short game')
    ) {
      score += 0.5;
    }
  } else if (lowerProblem.includes('bunker') || lowerProblem.includes('sand')) {
    if (
      lowerChallenge.includes('bunker') || 
      lowerChallenge.includes('sand')
    ) {
      score += 0.5;
    }
  } else if (lowerProblem.includes('driver')) {
    if (
      lowerChallenge.includes('drive') || 
      lowerChallenge.includes('tee shot') ||
      lowerChallenge.includes('fairway')
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
