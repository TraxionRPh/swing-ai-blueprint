
/**
 * Utility module for categorizing golf problems into core skill areas and
 * mapping them to appropriate challenge metrics and relevant drills.
 */

export interface ProblemCategory {
  name: string;
  keywords: string[];
  relatedClubs: string[];
  outcomeMetrics: string[];
  searchTerms: string[];
}

// Core skill categories in golf
export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  {
    name: "Ball Striking",
    keywords: ["striking", "contact", "chunk", "fat", "thin", "top", "skull", "compression", "ball first", "turf interaction", "impact"],
    relatedClubs: ["iron", "irons", "wedge", "wedges", "hybrid"],
    outcomeMetrics: ["Greens in Regulation", "Approach Shot Accuracy", "Ball Striking"],
    searchTerms: ["contact", "strike", "compress", "chunk", "thin", "impact"]
  },
  {
    name: "Driving Accuracy",
    keywords: ["slice", "hook", "push", "pull", "draw", "fade", "straight", "curve", "path", "face", "alignment"],
    relatedClubs: ["driver", "wood", "3-wood", "fairway wood", "tee", "tee shot"],
    outcomeMetrics: ["Fairways Hit", "Driving Accuracy", "Tee Shot"],
    searchTerms: ["slice", "hook", "path", "drive", "accuracy", "direction"]
  },
  {
    name: "Distance Control",
    keywords: ["distance", "short", "long", "yardage", "gapping", "club selection", "carry"],
    relatedClubs: ["iron", "irons", "wedge", "wedges", "driver", "wood"],
    outcomeMetrics: ["Proximity to Hole", "Distance Control", "Gapping"],
    searchTerms: ["distance", "short", "long", "yard", "consistent", "control"]
  },
  {
    name: "Short Game",
    keywords: ["chip", "pitch", "flop", "bunker", "sand", "up and down", "around the green"],
    relatedClubs: ["wedge", "wedges", "sand wedge", "lob wedge"],
    outcomeMetrics: ["Up and Down", "Scrambling", "Sand Save"],
    searchTerms: ["chip", "pitch", "bunker", "sand", "short game", "around green"]
  },
  {
    name: "Putting",
    keywords: ["putt", "green", "read", "lag", "short putt", "breaking", "aim"],
    relatedClubs: ["putter"],
    outcomeMetrics: ["Putts per Round", "Putts per GIR", "3-Putt Avoidance"],
    searchTerms: ["putt", "green", "read", "stroke", "speed", "line"]
  }
];

/**
 * Detects which club type the golfer is having issues with
 * based on their problem description
 * 
 * @param problem The specific problem description
 * @returns The detected club type or null if not detected
 */
export function detectClubType(problem: string): string | null {
  const lowerProblem = problem.toLowerCase();
  
  if (lowerProblem.includes("driver") || 
      lowerProblem.includes("tee shot") || 
      lowerProblem.includes("off the tee")) {
    return "driver";
  }
  
  if (lowerProblem.includes("iron") || 
      lowerProblem.includes("7 iron") || 
      lowerProblem.includes("6 iron") ||
      lowerProblem.includes("5 iron")) {
    return "irons";
  }
  
  if (lowerProblem.includes("wedge") || 
      lowerProblem.includes("sand wedge") || 
      lowerProblem.includes("pitch")) {
    return "wedges";
  }
  
  if (lowerProblem.includes("putt") || 
      lowerProblem.includes("green") || 
      lowerProblem.includes("putter")) {
    return "putter";
  }
  
  // Default cases based on common issues
  if (lowerProblem.includes("slice") || 
      lowerProblem.includes("hook") ||
      lowerProblem.includes("draw") ||
      lowerProblem.includes("fade")) {
    return "driver"; // Most common with driver
  }
  
  if (lowerProblem.includes("chunk") || 
      lowerProblem.includes("fat") ||
      lowerProblem.includes("thin") ||
      lowerProblem.includes("contact")) {
    return "irons"; // Most common with irons
  }
  
  return null;
}

/**
 * Identifies which problem category a specific golf issue belongs to
 * 
 * @param problem The specific problem description
 * @returns The most relevant problem category or null if not matched
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

/**
 * Extracts search terms based on the identified problem category
 * and the specific problem description
 * 
 * @param problem The specific problem description
 * @param category The identified problem category
 * @returns An array of relevant search terms
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
 * Identifies the expected outcome metric based on the problem category
 * 
 * @param category The identified problem category
 * @returns The primary outcome metric for this category
 */
export function getPrimaryOutcomeMetric(category: ProblemCategory): string {
  if (!category || !category.outcomeMetrics || category.outcomeMetrics.length === 0) {
    return "Score";
  }
  
  return category.outcomeMetrics[0];
}
