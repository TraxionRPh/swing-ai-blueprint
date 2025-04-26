
export interface Drill {
  id: string;  
  title: string;
  description?: string;
  overview: string;
  category: string;
  focus: string[] | null;
  difficulty: string;
  duration: string;
  video_url: string | null;
  instruction1?: string;
  instruction2?: string;
  instruction3?: string;
  instruction4?: string;
  instruction5?: string;
  common_mistake1?: string;
  common_mistake2?: string;
  common_mistake3?: string;
  common_mistake4?: string;
  common_mistake5?: string;
  pro_tip?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConfidencePoint {
  date: string;
  confidence: number;
}
