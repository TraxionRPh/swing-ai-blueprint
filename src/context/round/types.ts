
import { Course, HoleData } from "@/types/round-tracking";

export interface RoundContextType {
  currentRoundId: string | null;
  setCurrentRoundId: (id: string | null) => void;
  currentHoleNumber: number;
  setCurrentHoleNumber: (holeNumber: number) => void;
  holeCount: number;
  setHoleCount: (count: number) => void;
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  selectedTeeId: string | null;
  setSelectedTeeId: (teeId: string | null) => void;
  holeScores: HoleData[];
  setHoleScores: (scores: HoleData[]) => void;
  updateHoleScore: (holeData: HoleData) => Promise<boolean>;
  createRound: (courseId: string, teeId: string | null) => Promise<string | null>;
  finishRound: () => Promise<boolean>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  saveInProgress: boolean;
  hasFetchError?: boolean;
}
