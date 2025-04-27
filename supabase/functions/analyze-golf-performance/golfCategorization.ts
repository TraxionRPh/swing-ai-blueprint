
import { ProblemCategory, PROBLEM_CATEGORIES } from './types/categories.ts';
import { detectClubType } from './utils/clubDetector.ts';
import { extractRelevantSearchTerms, getPrimaryOutcomeMetric } from './utils/searchTermExtractor.ts';

/**
 * Identifies which problem category a specific golf issue belongs to
 */
export function identifyProblemCategory(problem: string): ProblemCategory | null {
  if (!problem) return null;
  
  const lowerProblem = problem.toLowerCase();
  let bestCategory = null;
  let highestScore = 0;
  
  for (const category of PROBLEM_CATEGORIES) {
    let score = 0;
    
    // Match keywords from the category
    for (const keyword of category.keywords) {
      if (lowerProblem.includes(keyword)) {
        score += 1;
      }
    }
    
    // Match clubs from the category
    for (const club of category.relatedClubs) {
      if (lowerProblem.includes(club)) {
        score += 2; // Club matches are more important
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }
  
  // If we have a reasonable match, return it
  if (highestScore >= 1) {
    return bestCategory;
  }
  
  // Default to Ball Striking as a fallback since it's the most fundamental
  return PROBLEM_CATEGORIES[0];
}

// Re-export everything needed by other modules
export { 
  ProblemCategory,
  PROBLEM_CATEGORIES,
  detectClubType,
  extractRelevantSearchTerms,
  getPrimaryOutcomeMetric
};
