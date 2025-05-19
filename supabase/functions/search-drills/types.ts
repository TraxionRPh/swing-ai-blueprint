
export interface Drill {
  id: string;
  title: string;
  overview?: string;
  focus?: string[];
  category?: string;
  difficulty?: string;
  duration?: string;
  instructions?: string;
  video_url?: string | null;
  relevanceScore?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category?: string;
  difficulty?: string;
  instruction1?: string;
  instruction2?: string;
  instruction3?: string;
}

export interface SearchResponse {
  drills: Drill[];
  analysis: string;
  challenge?: Challenge | null;
  error?: string;
}
