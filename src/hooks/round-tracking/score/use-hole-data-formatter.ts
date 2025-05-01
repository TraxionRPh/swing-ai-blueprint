import type { HoleData } from "@/types/round-tracking";

export const formatHoleScores = (scores: any[], holeInfo: any[], holeCount: number = 18, teeId?: string | null): HoleData[] => {
  console.log(`Formatting ${scores?.length || 0} scores with ${holeInfo?.length || 0} hole infos for ${holeCount} holes`);
  
  if (holeInfo && holeInfo.length > 0) {
    console.log("Sample hole info data:", holeInfo[0]);
  }
  
  return Array.from({ length: holeCount }, (_, i) => {
    const holeNumber = i + 1;
    const existingHole = scores?.find(h => h.hole_number === holeNumber);
    const courseHole = holeInfo?.find(h => h.hole_number === holeNumber);
    
    let distance = 0;
    
    // Try to get tee-specific distance if available
    if (courseHole) {
      if (teeId && courseHole.tee_distances && courseHole.tee_distances[teeId]) {
        distance = courseHole.tee_distances[teeId];
        console.log(`Using tee-specific distance for hole ${holeNumber}: ${distance}yd`);
      } else if (courseHole.distance_yards) {
        distance = courseHole.distance_yards;
        console.log(`Using default distance for hole ${holeNumber}: ${distance}yd`);
      }
    }
    
    if (courseHole) {
      console.log(`Found course hole data for hole ${holeNumber}: par ${courseHole.par}, distance ${distance}yd`);
    }
    
    return {
      holeNumber: holeNumber,
      par: courseHole?.par || 4,
      distance: distance,
      score: existingHole?.score || 0,
      putts: existingHole?.putts || 0,
      fairwayHit: existingHole?.fairway_hit || false,
      greenInRegulation: existingHole?.green_in_regulation || false
    };
  });
};

export const initializeDefaultScores = (holeCount: number = 18, courseHoles?: any[]): HoleData[] => {
  console.log(`Initializing ${holeCount} default scores with ${courseHoles?.length || 0} course holes data`);
  
  // If we have course holes data, use it to initialize scores
  if (courseHoles && courseHoles.length > 0) {
    return formatHoleScores([], courseHoles, holeCount);
  }
  
  // Otherwise, create completely default data
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
