
import { Drill } from "./drill";

export interface GeneratedPracticePlan {
  problem: string;
  diagnosis: string;
  rootCauses: string[];
  recommendedDrills: Drill[];
  practicePlan: {
    duration: string;
    frequency: string;
    plan: DayPlan[];
  };
}

export interface DayPlan {
  day: number;
  drills: DrillWithSets[];
  focus: string;
  duration: string;
}

export interface DrillWithSets {
  drill: Drill;
  sets: number;
  reps: number;
}

export interface SavedPracticePlan {
  id: string;
  user_id: string;
  problem: string;
  diagnosis: string;
  root_causes: string[];
  recommended_drills: Drill[];
  practice_plan: GeneratedPracticePlan;
  created_at: string;
  updated_at: string;
}

export interface ConfidencePoint {
  date: string;
  confidence: number;
}

export interface CommonProblem {
  id: number;
  problem: string;
  description: string;
  popularity: string;
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
  identifiedIssues: {
    area: string;
    description: string;
    priority: string;
  }[];
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

