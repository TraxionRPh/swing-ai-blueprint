
// Define the problem category structure
interface ProblemCategory {
  name: string;
  relatedClubs: string[];
  outcomeMetrics: string[];
  keywords: string[];
  requiredContext?: string[]; // Context terms that must be present
  subcategories?: string[]; // Subcategories for more specific matching
  exclusionKeywords?: string[]; // Terms that indicate this is NOT the right category
  primaryContext?: string[]; // Strong contextual indicators (high weight)
  secondaryContext?: string[]; // Supporting contextual indicators
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
      requiredContext: ['tee', 'driver', 'fairway'],
      primaryContext: ['driver', 'tee shot', 'slice', 'hook'],
      secondaryContext: ['fairway', 'distance', 'off the tee'],
      exclusionKeywords: ['putt', 'chip', 'pitch', 'bunker', 'iron play']
    },
    {
      name: 'Iron Play',
      relatedClubs: ['iron', 'hybrid', '5-iron', '7-iron', '9-iron'],
      outcomeMetrics: ['accuracy', 'greens in regulation', 'distance control'],
      keywords: ['iron', 'approach', 'thin', 'fat', 'chunk', 'greens', 'contact', 'strike'],
      requiredContext: ['iron', 'approach', 'full swing'],
      primaryContext: ['iron', 'approach', 'greens in regulation', 'ball striking'],
      secondaryContext: ['contact', 'fat', 'thin', 'chunking', 'topping'],
      exclusionKeywords: ['putt', 'driver', 'tee', 'bunker', 'chip']
    },
    {
      name: 'Short Game',
      relatedClubs: ['wedge', 'pitching wedge', 'sand wedge', 'lob wedge'],
      outcomeMetrics: ['up and down percentage', 'proximity to hole'],
      keywords: ['chip', 'pitch', 'wedge', 'bunker', 'sand', 'around the green', 'short game'],
      requiredContext: ['chip', 'pitch', 'wedge', 'bunker'],
      primaryContext: ['chip', 'pitch', 'bunker', 'wedge', 'short game'],
      secondaryContext: ['around the green', 'flop', 'up and down', 'sand'],
      exclusionKeywords: ['driver', 'putt', 'full swing', 'tee shot'],
      subcategories: ['bunker play', 'chipping', 'pitching']
    },
    {
      name: 'Putting',
      relatedClubs: ['putter'],
      outcomeMetrics: ['putts per round', 'putts per green in regulation', 'make percentage'],
      keywords: ['putt', 'green', 'roll', 'stroke', 'line', 'read', 'speed', 'lag'],
      requiredContext: ['putt', 'green', 'putter'],
      primaryContext: ['putt', 'green', 'stroke', 'line', 'speed'],
      secondaryContext: ['lag', 'read', 'roll', 'short putt'],
      exclusionKeywords: ['driver', 'iron', 'chip', 'pitch', 'sand'],
      subcategories: ['lag putting', 'short putts', 'green reading']
    },
    {
      name: 'Mental Game',
      relatedClubs: [],
      outcomeMetrics: ['scoring average', 'consistency'],
      keywords: ['focus', 'confidence', 'anxiety', 'pressure', 'mental', 'routine', 'visualize'],
      requiredContext: ['mental', 'routine', 'focus'],
      primaryContext: ['mental', 'focus', 'confidence', 'pressure', 'routine'],
      secondaryContext: ['anxiety', 'consistency', 'visualization', 'practice'],
      exclusionKeywords: []
    },
    {
      name: 'General',
      relatedClubs: [],
      outcomeMetrics: ['score', 'handicap'],
      keywords: ['overall', 'general', 'improve', 'better', 'consistent', 'lower scores'],
      requiredContext: [],
      primaryContext: ['overall', 'general', 'everything'],
      secondaryContext: ['improve', 'better', 'consistent'],
      exclusionKeywords: []
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

    // Primary context terms (very strong indicators)
    if (category.primaryContext) {
      const primaryMatches = category.primaryContext.filter(ctx => 
        normalizedProblem.includes(ctx)
      ).length;
      
      if (primaryMatches > 0) {
        matchScore += primaryMatches * 4; // Very high weight for primary context
      }
    }
    
    // Secondary context terms (supporting indicators)
    if (category.secondaryContext) {
      const secondaryMatches = category.secondaryContext.filter(ctx => 
        normalizedProblem.includes(ctx)
      ).length;
      
      if (secondaryMatches > 0) {
        matchScore += secondaryMatches * 2; // Medium weight for secondary context
      }
    }
    
    // Apply penalties for exclusion terms
    if (category.exclusionKeywords && category.exclusionKeywords.length > 0) {
      const exclusionMatches = category.exclusionKeywords.filter(term =>
        normalizedProblem.includes(term)
      ).length;
      
      if (exclusionMatches > 0) {
        matchScore -= exclusionMatches * 5; // Heavy penalty for exclusion terms
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
  } else if (normalizedProblem.includes('chip')) {
    relevantKeywords = ['chip', 'short game', 'around green', 'up and down'];
  } else if (normalizedProblem.includes('slice') || normalizedProblem.includes('hook')) {
    relevantKeywords = ['path', 'face', 'grip', 'alignment', 'slice', 'hook'];
  } else if (normalizedProblem.includes('top') || normalizedProblem.includes('thin')) {
    relevantKeywords = ['contact', 'position', 'posture', 'weight', 'top', 'thin'];
  } else {
    relevantKeywords = category.keywords.slice(0, 5);
  }
  
  // Add primary context terms for stronger matching
  if (category.primaryContext) {
    relevantKeywords = [...relevantKeywords, ...category.primaryContext];
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

// Function to identify specific subcategory with stricter matching
export function identifySubcategory(problem: string, category: ProblemCategory): string | null {
  if (!category.subcategories) return null;
  
  const normalizedProblem = problem.toLowerCase();
  
  // Special handling for putting subcategories
  if (category.name === 'Putting') {
    if (normalizedProblem.includes('lag') || 
        normalizedProblem.includes('distance control') || 
        normalizedProblem.includes('long putt')) {
      return 'lag putting';
    } else if (normalizedProblem.includes('short') || 
               normalizedProblem.includes('3 foot') || 
               normalizedProblem.includes('4 foot') || 
               normalizedProblem.includes('5 foot') ||
               normalizedProblem.includes('close range')) {
      return 'short putts';
    } else if (normalizedProblem.includes('read') || 
               normalizedProblem.includes('break') || 
               normalizedProblem.includes('slope') || 
               normalizedProblem.includes('green reading')) {
      return 'green reading';
    }
  }
  
  // Special handling for short game subcategories with improved matching
  if (category.name === 'Short Game') {
    // Check multiple forms and related terms for bunker play
    if (normalizedProblem.includes('bunker') || 
        normalizedProblem.includes('sand') || 
        normalizedProblem.includes('trap') ||
        normalizedProblem.includes('explosion')) {
      return 'bunker play';
    }
    
    // Expanded chipping detection
    else if (normalizedProblem.includes('chip') || 
             normalizedProblem.includes('around the green') ||
             normalizedProblem.includes('just off green')) {
      return 'chipping';
    }
    
    // Expanded pitching detection  
    else if (normalizedProblem.includes('pitch') || 
             normalizedProblem.includes('lob') ||
             normalizedProblem.includes('flop')) {
      return 'pitching';
    }
  }
  
  // If no specific subcategory was identified, check for partial matches
  for (const subcategory of category.subcategories) {
    // Check if the subcategory keywords appear in the problem
    const subcategoryKeywords = subcategory.split(' ');
    if (subcategoryKeywords.some(keyword => normalizedProblem.includes(keyword))) {
      return subcategory;
    }
  }
  
  return null;
}

// Additional helper: Validate that a drill or challenge matches the identified subcategory
export function validateContextMatch(itemText: string, problem: string, category: ProblemCategory): boolean {
  // If there's no category, we can't validate
  if (!category) return true;
  
  const normalizedText = itemText.toLowerCase();
  const normalizedProblem = problem.toLowerCase();
  
  // 1. Check for exclusion keywords - immediate disqualification
  if (category.exclusionKeywords) {
    for (const exclusion of category.exclusionKeywords) {
      // If problem doesn't contain the exclusion but the item does, it's a mismatch
      if (!normalizedProblem.includes(exclusion) && normalizedText.includes(exclusion)) {
        return false;
      }
    }
  }
  
  // 2. For putting problems, validate strong putting context
  if (normalizedProblem.includes('putt') || normalizedProblem.includes('green')) {
    // Putting problems should only match with putting-related content
    const puttingTerms = ['putt', 'green', 'hole', 'stroke', 'line', 'speed'];
    const hasPuttingContext = puttingTerms.some(term => normalizedText.includes(term));
    
    // For putting problems, directly require putting context
    if (!hasPuttingContext) return false;
  }
  
  // 3. For bunker problems, validate strong bunker context
  if (normalizedProblem.includes('bunker') || normalizedProblem.includes('sand')) {
    const bunkerTerms = ['bunker', 'sand', 'explosion', 'splash', 'trap'];
    const hasBunkerContext = bunkerTerms.some(term => normalizedText.includes(term));
    
    // For bunker problems, directly require bunker context
    if (!hasBunkerContext) return false;
  }
  
  // 4. For topping/thin hits, validate relevant context
  if (normalizedProblem.includes('top') || normalizedProblem.includes('thin')) {
    const contactTerms = ['contact', 'strike', 'ball position', 'posture', 'weight', 'compression'];
    const hasContactContext = contactTerms.some(term => normalizedText.includes(term));
    
    if (!hasContactContext) return false;
  }
  
  // 5. Check that the identified subcategory is present
  const subcategory = identifySubcategory(problem, category);
  if (subcategory) {
    return normalizedText.includes(subcategory.toLowerCase());
  }
  
  // 6. Check for minimal required context match
  if (category.primaryContext) {
    const primaryMatches = category.primaryContext.filter(context => 
      normalizedText.includes(context)
    ).length;
    
    if (primaryMatches === 0) {
      // No primary context matches, check if secondary context matches
      if (category.secondaryContext) {
        const secondaryMatches = category.secondaryContext.filter(context =>
          normalizedText.includes(context)
        ).length;
        
        // Require at least some secondary context if no primary matches
        return secondaryMatches >= 2;
      }
      return false; // No context matches
    }
  }
  
  return true;
}
