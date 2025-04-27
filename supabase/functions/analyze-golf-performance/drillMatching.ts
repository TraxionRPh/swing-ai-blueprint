
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
  
  // Match specific problems
  if (lowerProblem.includes('slice') || lowerProblem.includes('slicing')) {
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
