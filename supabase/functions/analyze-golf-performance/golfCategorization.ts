
// This file provides utilities for categorizing golf problems by type

// Define the problem category structure
interface ProblemCategory {
  name: string;
  relatedClubs: string[];
  outcomeMetrics: string[];
  keywords: string[];
}

// Main categorization function
export function identifyProblemCategory(problem: string | undefined): ProblemCategory | null {
  if (!problem) return null;
  
  const normalizedProblem = problem.toLowerCase();
  
  // Define categories with their related attributes
  const categories: ProblemCategory[] = [
    {
      name: 'Driving',
      relatedClubs: ['driver', '3-wood', 'fairway wood'],
      outcomeMetrics: ['accuracy', 'distance', 'dispersion'],
      keywords: ['drive', 'slice', 'hook', 'tee shot', 'off the tee', 'fairway', 'distance']
    },
    {
      name: 'Iron Play',
      relatedClubs: ['iron', 'hybrid', '5-iron', '7-iron', '9-iron'],
      outcomeMetrics: ['accuracy', 'greens in regulation', 'distance control'],
      keywords: ['iron', 'approach', 'thin', 'fat', 'chunk', 'greens', 'contact', 'strike']
    },
    {
      name: 'Short Game',
      relatedClubs: ['wedge', 'pitching wedge', 'sand wedge', 'lob wedge'],
      outcomeMetrics: ['up and down percentage', 'proximity to hole'],
      keywords: ['chip', 'pitch', 'wedge', 'bunker', 'sand', 'around the green', 'short game']
    },
    {
      name: 'Putting',
      relatedClubs: ['putter'],
      outcomeMetrics: ['putts per round', 'putts per green in regulation', 'make percentage'],
      keywords: ['putt', 'green', 'roll', 'stroke', 'line', 'read', 'speed', 'lag']
    },
    {
      name: 'Mental Game',
      relatedClubs: [],
      outcomeMetrics: ['scoring average', 'consistency'],
      keywords: ['focus', 'confidence', 'anxiety', 'pressure', 'mental', 'routine', 'visualize']
    },
    {
      name: 'General',
      relatedClubs: [],
      outcomeMetrics: ['score', 'handicap'],
      keywords: ['overall', 'general', 'improve', 'better', 'consistent', 'lower scores']
    }
  ];
  
  // Find the best matching category based on keywords
  let bestMatch: ProblemCategory | null = null;
  let highestMatchScore = 0;
  
  for (const category of categories) {
    let matchScore = 0;
    
    // Check for keyword matches
    for (const keyword of category.keywords) {
      if (normalizedProblem.includes(keyword)) {
        matchScore++;
      }
    }
    
    // Check for club mentions
    for (const club of category.relatedClubs) {
      if (normalizedProblem.includes(club)) {
        matchScore += 2; // Club mentions are strong indicators
      }
    }
    
    if (matchScore > highestMatchScore) {
      highestMatchScore = matchScore;
      bestMatch = category;
    }
  }
  
  // Default to General category if no good match found
  return highestMatchScore > 0 ? bestMatch : categories[categories.length - 1];
}

// Helper function for extracting terms for search
export function extractRelevantSearchTerms(
  problem: string,
  category: ProblemCategory
): string[] {
  const normalizedProblem = problem.toLowerCase();
  
  // Start with category-specific keywords
  const searchTerms = [...category.keywords.slice(0, 3)];
  
  // Add problem-specific words, filtering out common words
  const problemWords = normalizedProblem
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !['the', 'and', 'with', 'that', 'have', 'this', 'from'].includes(word)
    )
    .slice(0, 5);
  
  return [...new Set([...searchTerms, ...problemWords])];
}
