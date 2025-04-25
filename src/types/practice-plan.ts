
export interface CommonProblem {
  id: number;
  problem: string;
  description: string;
  popularity: string;
}

export interface GeneratedPracticePlan {
  problem: string;
  diagnosis: string;
  rootCauses: string[];
  recommendedDrills: {
    name: string;
    description: string;
    difficulty: string;
    duration: string;
    focus: string[];
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
