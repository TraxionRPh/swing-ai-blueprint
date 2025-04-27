
import { ProblemCategory } from '../types/categories.ts';
import { detectClubType } from './clubDetector.ts';

/**
 * Extracts search terms based on the identified problem category
 * and the specific problem description
 */
export function extractRelevantSearchTerms(problem: string, category: ProblemCategory): string[] {
  const lowerProblem = problem.toLowerCase();
  const searchTerms = new Set<string>();
  
  // Add all terms from the category
  for (const term of category.searchTerms) {
    searchTerms.add(term);
  }
  
  // Add the club type if detected
  const clubType = detectClubType(problem);
  if (clubType) {
    searchTerms.add(clubType);
  }
  
  // Add specific issue keywords
  if (lowerProblem.includes('top') || lowerProblem.includes('topping')) {
    searchTerms.add('topping');
    searchTerms.add('ball');
  }
  if (lowerProblem.includes('chunk') || lowerProblem.includes('fat')) {
    searchTerms.add('chunking');
    searchTerms.add('fat');
  }
  if (lowerProblem.includes('thin') || lowerProblem.includes('skull')) {
    searchTerms.add('thin');
    searchTerms.add('skull');
  }
  if (lowerProblem.includes('slice') || lowerProblem.includes('slicing')) {
    searchTerms.add('slice');
  }
  if (lowerProblem.includes('hook') || lowerProblem.includes('hooking')) {
    searchTerms.add('hook');
  }
  
  // Add specific words from the problem that are more than 3 chars
  const problemWords = lowerProblem
    .split(/[\s-]+/)
    .filter(word => word.length > 3 && !word.match(/^(with|have|from|that|this|when|where|what|there|these|those|them)$/));
  
  for (const word of problemWords) {
    searchTerms.add(word.replace(/[^\w]/g, ''));
  }
  
  return Array.from(searchTerms);
}

/**
 * Gets the primary outcome metric for a given problem category
 */
export function getPrimaryOutcomeMetric(category: ProblemCategory): string {
  if (!category || !category.outcomeMetrics || category.outcomeMetrics.length === 0) {
    return "Score";
  }
  return category.outcomeMetrics[0];
}
