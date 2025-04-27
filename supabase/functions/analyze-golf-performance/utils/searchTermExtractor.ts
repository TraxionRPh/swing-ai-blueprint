
import { ProblemCategory } from '../types/categories.ts';

// Memoization cache for search term extraction
const termCache = new Map<string, string[]>();

/**
 * Extracts relevant search terms from a problem description based on category
 */
export function extractRelevantSearchTerms(problem: string, category: ProblemCategory): string[] {
  // Create a cache key using problem and category name
  const cacheKey = `${problem}-${category.name}`;
  
  // Check if we have cached results
  if (termCache.has(cacheKey)) {
    return termCache.get(cacheKey)!;
  }
  
  const baseTerms = problem.toLowerCase().split(/[\s,.!?;:()\-]+/).filter(word => word.length > 2);
  const relevantTerms = new Set<string>(baseTerms);
  
  // Add category-specific terms
  switch (category.name.toLowerCase()) {
    case 'ball striking':
      addTermsToSet(relevantTerms, ['ball', 'strike', 'contact', 'iron', 'compression']);
      break;
    case 'driving accuracy':
      addTermsToSet(relevantTerms, ['driver', 'slice', 'hook', 'accuracy', 'tee', 'fairway']);
      break;
    case 'short game':
      addTermsToSet(relevantTerms, ['chip', 'pitch', 'wedge', 'bunker', 'sand']);
      break;
    case 'putting':
      addTermsToSet(relevantTerms, ['putt', 'green', 'read', 'speed', 'line']);
      break;
    case 'course management':
      addTermsToSet(relevantTerms, ['strategy', 'management', 'decision', 'planning']);
      break;
  }
  
  // Convert to array, cache, and return
  const result = Array.from(relevantTerms);
  termCache.set(cacheKey, result);
  return result;
}

function addTermsToSet(set: Set<string>, terms: string[]): void {
  for (const term of terms) {
    set.add(term);
  }
}

// Map categories to metrics - this is a static mapping that doesn't need to be recalculated
const categoryMetricMap = new Map([
  ['ball striking', 'Greens in Regulation'],
  ['driving accuracy', 'Fairways Hit'],
  ['short game', 'Up and Down Percentage'],
  ['putting', 'Putts per Round'],
  ['course management', 'Score Relative to Handicap']
]);

/**
 * Gets the primary outcome metric for a given problem category
 */
export function getPrimaryOutcomeMetric(category: ProblemCategory): string {
  return categoryMetricMap.get(category.name.toLowerCase()) || "Overall Score";
}
