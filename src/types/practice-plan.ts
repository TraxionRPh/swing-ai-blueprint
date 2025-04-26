
export interface CommonProblem {
  id: number;
  problem: string;
  description: string;
  popularity: string;
}

export interface GeneratedPracticePlan {
  id?: string;
  problem: string;
  diagnosis: string;
  rootCauses: string[];
  recommendedDrills: {
    name: string;
    description: string;
    difficulty: string;
    duration: string;
    focus: string[];
    instructions?: string[];
  }[];
  practicePlan: {
    duration: string;
    frequency: string;
    sessions: {
      focus: string;
      drills: string[];
      duration: string;
    }[];
  };
  progressChallenge?: {
    name: string;
    description: string;
    steps: string[];
  };
}

export interface AIAnalysisForPracticePlan {
  performanceAnalysis: {
    driving: number;
    ironPlay: number;
    chipping: number;
    bunker: number;
    putting: number;
  };
  aiConfidence: number;
  identifiedIssues: Array<{
    area: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
  recommendedPractice: {
    weeklyFocus: string;
    primaryDrill: {
      name: string;
      description: string;
      frequency: string;
    };
    secondaryDrill: {
      name: string;
      description: string;
      frequency: string;
    };
    weeklyAssignment: string;
  };
}

export interface SavedPracticePlan {
  id: string;
  user_id: string;
  problem: string;
  diagnosis: string;
  root_causes: string[];
  recommended_drills: any[];
  practice_plan: GeneratedPracticePlan;
  created_at: string;
  updated_at: string;
}
