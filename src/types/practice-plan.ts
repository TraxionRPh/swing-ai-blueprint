
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
