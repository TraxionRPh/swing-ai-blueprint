
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
    keywords: ["striking", "contact", "chunk", "fat", "thin", "top", "topping", "skull", "compression", "ball first", "turf interaction", "impact"],
    relatedClubs: ["iron", "irons", "wedge", "wedges", "hybrid"],
    outcomeMetrics: ["Greens in Regulation", "Approach Shot Accuracy", "Ball Striking"],
    searchTerms: ["contact", "strike", "compress", "chunk", "thin", "impact", "top", "topping"]
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
