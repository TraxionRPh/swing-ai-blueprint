import { Drill } from "./drill";

export interface GeneratedPracticePlan {
  practicePlan: {
    duration: string;
    plan: DayPlan[];
  };
}

export interface DayPlan {
  day: number;
  drills: DrillWithSets[];
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
