
/**
 * Types for the search-drills function
 */

export interface Drill {
  id: string;
  title: string;
  overview?: string;
  focus?: string[];
  category?: string;
  difficulty?: string;
  instructions?: string;
  [key: string]: any;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  metric?: string;
  metrics?: string[];
  instruction1?: string;
  instruction2?: string;
  instruction3?: string;
  [key: string]: any;
}

export interface SearchResponse {
  drills: Drill[];
  analysis: string;
  challenge: Challenge | null;
}
