
import type { HoleData } from "@/types/round-tracking";

export const formatHoleScores = (scores: any[], holeInfo: any[], holeCount: number = 18): HoleData[] => {
  console.log(`Formatting ${scores?.length || 0} scores with ${holeInfo?.length || 0} hole infos for ${holeCount} holes`);
  
  if (holeInfo && holeInfo.length > 0) {
    console.log("Sample hole info data:", holeInfo[0]);
  }
  
  return Array.from({ length: holeCount }, (_, i) => {
    const holeNumber = i + 1;
    const existingHole = scores?.find(h => h.hole_number === holeNumber);
    const courseHole = holeInfo?.find(h => h.hole_number === holeNumber);
    
    if (courseHole) {
      console.log(`Found course hole data for hole ${holeNumber}: par ${courseHole.par}, distance ${courseHole.distance_yards}yd`);
    }
    
    return {
      holeNumber: holeNumber,
      par: courseHole?.par || 4,
      distance: courseHole?.distance_yards || 0,
      score: existingHole?.score || 0,
      putts: existingHole?.putts || 0,
      fairwayHit: existingHole?.fairway_hit || false,
      greenInRegulation: existingHole?.green_in_regulation || false
    };
  });
};

export const initializeDefaultScores = (holeCount: number = 18, courseHoles?: any[]): HoleData[] => {
  console.log(`Initializing ${holeCount} default scores with ${courseHoles?.length || 0} course holes data`);
  
  return Array.from({ length: holeCount }, (_, i) => {
    const holeNumber = i + 1;
    const courseHole = courseHoles?.find(h => h.hole_number === holeNumber);
    
    if (courseHole) {
      console.log(`Using course data for hole ${holeNumber}: par ${courseHole.par}, distance ${courseHole.distance_yards}yd`);
    }
    
    return {
      holeNumber: holeNumber,
      par: courseHole?.par || 4,
      distance: courseHole?.distance_yards || 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
  });
};
