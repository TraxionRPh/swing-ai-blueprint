
import { Course, HoleData } from "@/types/round-tracking";

export interface RoundContextType {
  // Current round state
  currentRoundId: string | null;
  setCurrentRoundId: (id: string | null) => void;
  currentHoleNumber: number;
  setCurrentHoleNumber: (holeNumber: number) => void;
  holeCount: number;
  setHoleCount: (count: number) => void;
  
  // Course and tee state
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  selectedTeeId: string | null;
  setSelectedTeeId: (teeId: string | null) => void;
  
  // Hole data management
  holeScores: HoleData[];
  setHoleScores: (scores: HoleData[]) => void;
  updateHoleScore: (holeData: HoleData) => Promise<boolean>;
  
  // Round operations
  createRound: (courseId: string, teeId: string | null) => Promise<string | null>;
  finishRound: () => Promise<boolean>;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  saveInProgress: boolean;
}
