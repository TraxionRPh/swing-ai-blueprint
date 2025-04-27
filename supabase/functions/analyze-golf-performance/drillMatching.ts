
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

// Enhanced function to better identify putting-related drills
export function isPuttingRelated(drill: any): boolean {
  if (!drill) return false;
  
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(drill.focus?.map((f: string) => f.toLowerCase()) || [])
  ].join(' ');
  
  const puttingTerms = [
    'putt', 'putting', 'putter', 'green', 'hole', 'cup', 'lag', 
    'short putt', 'long putt', 'read', 'line', 'speed', 'stroke', 
    'grip', 'stance', 'alignment', 'aim', 'roll'
  ];
  
  return puttingTerms.some(term => drillText.includes(term));
}

