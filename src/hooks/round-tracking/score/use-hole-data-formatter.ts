
import type { HoleData } from "@/types/round-tracking";

export const formatHoleScores = (scores: any[], holeInfo: any[], holeCount: number = 18): HoleData[] => {
  return Array.from({ length: holeCount }, (_, i) => {
    const existingHole = scores.find(h => h.hole_number === i + 1);
    const courseHole = holeInfo.find(h => h.hole_number === i + 1);
    
    return {
      holeNumber: i + 1,
      par: courseHole?.par || 4,
      distance: courseHole?.distance_yards || 0,
      score: existingHole?.score || 0,
      putts: existingHole?.putts || 0,
      fairwayHit: existingHole?.fairway_hit || false,
      greenInRegulation: existingHole?.green_in_regulation || false
    };
  });
};

export const initializeDefaultScores = (holeCount: number = 18): HoleData[] => {
  return Array.from({ length: holeCount }, (_, i) => ({
    holeNumber: i + 1,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false
  }));
};
