
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
    'grip', 'stance', 'alignment', 'aim', 'roll', 'distance control',
    'feel', 'touch', 'break', 'slope', 'green reading'
  ];
  
  // First check category directly
  if (drill.category && drill.category.toLowerCase() === 'putting') {
    return true;
  }
  
  // Then check for putting terms in the drill text
  return puttingTerms.some(term => drillText.includes(term));
}

// Determine if a drill is relevant to a specific problem
export function isDrillRelevantToProblem(drill: any, problem: string): boolean {
  if (!drill || !problem) return false;
  
  const problemLower = problem.toLowerCase();
  const drillText = [
    drill.title?.toLowerCase() || '',
    drill.overview?.toLowerCase() || '',
    drill.category?.toLowerCase() || '',
    ...(drill.focus?.map((f: string) => f.toLowerCase()) || [])
  ].join(' ');
  
  // Special handling for putting problems
  if (problemLower.includes('putt') || 
      problemLower.includes('green') || 
      problemLower.includes('short game')) {
    return isPuttingRelated(drill);
  }
  
  // Special handling for driving/slicing problems
  if (problemLower.includes('slice') || problemLower.includes('hook') || 
      problemLower.includes('driver') || problemLower.includes('tee')) {
    return drillText.includes('driver') || 
           drillText.includes('tee') || 
           drillText.includes('slice') || 
           drillText.includes('hook') ||
           drillText.includes('path');
  }
  
  // Special handling for topping problems
  if (problemLower.includes('top') || problemLower.includes('thin')) {
    return drillText.includes('contact') || 
           drillText.includes('strike') || 
           drillText.includes('compression') || 
           drillText.includes('impact') ||
           drillText.includes('position');
  }
  
  // General relevance check - look for problem keywords in drill text
  const problemKeywords = problemLower
    .split(/\s+/)
    .filter(word => word.length > 3 && !['with', 'the', 'and', 'for', 'golf'].includes(word));
    
  return problemKeywords.some(keyword => drillText.includes(keyword));
}
