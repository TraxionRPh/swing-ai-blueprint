
export interface AnalyzeRequest {
  userId?: string;
  roundData?: any[];
  handicapLevel?: string;
  specificProblem?: string;
  planDuration?: string;
  availableDrills?: any[];
}

export interface DrillData {
  id: string;
  title: string;
  overview?: string;
  category?: string;
  focus?: string[];
  difficulty?: string;
  duration?: string;
  video_url?: string | null;
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
  relevanceScore?: number;
}

export interface PlanDay {
  day: number;
  focus: string;
  duration: string;
  drills: any[];
}

export interface PracticePlan {
  plan: PlanDay[];
  challenge?: any;
}

export interface PerformanceInsight {
  area: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AIResponse {
  diagnosis: string;
  rootCauses: string[];
  practicePlan: PracticePlan;
  performanceInsights?: PerformanceInsight[];
}
