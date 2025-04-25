
export interface Drill {
  id: string;  
  title: string;
  description?: string;  // Optional
  overview: string;
  category: string;
  focus: string[];
  difficulty: string;
  duration: string;
  video_url: string | null;
  instructions?: string;  // Optional
  created_at?: string;
  updated_at?: string;
}

export interface ConfidencePoint {
  date: string;
  confidence: number;
}
