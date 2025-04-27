
// Define the problem category structure
interface ProblemCategory {
  name: string;
  relatedClubs: string[];
  outcomeMetrics: string[];
  keywords: string[];
  requiredContext?: string[]; // New field for required context
  subcategories?: string[]; // New field for subcategories
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
      keywords: ['drive', 'slice', 'hook', 'tee shot', 'off the tee', 'fairway', 'distance'],
      requiredContext: ['tee', 'driver', 'fairway']
    },
    {
      name: 'Iron Play',
      relatedClubs: ['iron', 'hybrid', '5-iron', '7-iron', '9-iron'],
      outcomeMetrics: ['accuracy', 'greens in regulation', 'distance control'],
      keywords: ['iron', 'approach', 'thin', 'fat', 'chunk', 'greens', 'contact', 'strike'],
      requiredContext: ['iron', 'approach', 'full swing']
    },
    {
      name: 'Short Game',
      relatedClubs: ['wedge', 'pitching wedge', 'sand wedge', 'lob wedge'],
      outcomeMetrics: ['up and down percentage', 'proximity to hole'],
      keywords: ['chip', 'pitch', 'wedge', 'bunker', 'sand', 'around the green', 'short game'],
      requiredContext: ['chip', 'pitch', 'wedge', 'bunker'],
      subcategories: ['bunker play', 'chipping', 'pitching']
    },
    {
      name: 'Putting',
      relatedClubs: ['putter'],
      outcomeMetrics: ['putts per round', 'putts per green in regulation', 'make percentage'],
      keywords: ['putt', 'green', 'roll', 'stroke', 'line', 'read', 'speed', 'lag'],
      requiredContext: ['putt', 'green', 'putter'],
      subcategories: ['lag putting', 'short putts', 'green reading']
    },
    {
      name: 'Mental Game',
      relatedClubs: [],
      outcomeMetrics: ['scoring average', 'consistency'],
      keywords: ['focus', 'confidence', 'anxiety', 'pressure', 'mental', 'routine', 'visualize'],
      requiredContext: ['mental', 'routine', 'focus']
    },
    {
      name: 'General',
      relatedClubs: [],
      outcomeMetrics: ['score', 'handicap'],
      keywords: ['overall', 'general', 'improve', 'better', 'consistent', 'lower scores'],
      requiredContext: []
    }
  ];
  
  // Find the best matching category based on keywords and context
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
    
    // Check for club mentions (strong indicators)
    for (const club of category.relatedClubs) {
      if (normalizedProblem.includes(club)) {
        matchScore += 2;
      }
    }

    // Check for required context (critical for accurate categorization)
    if (category.requiredContext && category.requiredContext.length > 0) {
      const contextMatches = category.requiredContext.filter(ctx => 
        normalizedProblem.includes(ctx)
      ).length;
      
      if (contextMatches > 0) {
        matchScore += contextMatches * 3; // Heavy weight for context matches
      }
    }

    // Special handling for putting and bunker problems
    if (category.name === 'Putting' && normalizedProblem.includes('putt')) {
      matchScore += 5; // Strong boost for putting-specific problems
    } else if (category.name === 'Short Game' && 
              (normalizedProblem.includes('bunker') || normalizedProblem.includes('sand'))) {
      matchScore += 5; // Strong boost for bunker-specific problems
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
  
  // Get category-specific keywords based on problem context
  let relevantKeywords = [];
  
  if (normalizedProblem.includes('putt')) {
    relevantKeywords = ['putt', 'green', 'stroke', 'line', 'speed'];
  } else if (normalizedProblem.includes('bunker') || normalizedProblem.includes('sand')) {
    relevantKeywords = ['bunker', 'sand', 'explosion', 'splash'];
  } else {
    relevantKeywords = category.keywords.slice(0, 5);
  }
  
  // Add problem-specific words, filtering out common words
  const problemWords = normalizedProblem
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !['the', 'and', 'with', 'that', 'have', 'this', 'from'].includes(word)
    )
    .slice(0, 5);
  
  return [...new Set([...relevantKeywords, ...problemWords])];
}

// New function to identify specific subcategory
export function identifySubcategory(problem: string, category: ProblemCategory): string | null {
  if (!category.subcategories) return null;
  
  const normalizedProblem = problem.toLowerCase();
  
  // Special handling for putting subcategories
  if (category.name === 'Putting') {
    if (normalizedProblem.includes('lag') || normalizedProblem.includes('distance')) {
      return 'lag putting';
    } else if (normalizedProblem.includes('short') || normalizedProblem.includes('3 foot') || 
               normalizedProblem.includes('4 foot') || normalizedProblem.includes('5 foot')) {
      return 'short putts';
    } else if (normalizedProblem.includes('read') || normalizedProblem.includes('break')) {
      return 'green reading';
    }
  }
  
  // Special handling for short game subcategories
  if (category.name === 'Short Game') {
    if (normalizedProblem.includes('bunker') || normalizedProblem.includes('sand')) {
      return 'bunker play';
    } else if (normalizedProblem.includes('chip')) {
      return 'chipping';
    } else if (normalizedProblem.includes('pitch')) {
      return 'pitching';
    }
  }
  
  return null;
}

