
import React from "react";
import { HoleScoreCardContainer } from "./HoleScoreCardContainer";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreCardProps {
  holeData: HoleData;
  onUpdate: (data: HoleData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSaving?: boolean;
  currentHole?: number;
  holeCount?: number;
  teeColor?: string;
  courseId?: string;
  teeId?: string;
}

export const HoleScoreCard = (props: HoleScoreCardProps) => {
  // Ensure holeData has valid values before rendering
  if (!props.holeData || typeof props.holeData.par === 'undefined') {
    console.log("Warning: Invalid hole data provided to HoleScoreCard", props.holeData);
    // Provide default data if holeData is missing or incomplete
    const defaultData: HoleData = {
      holeNumber: props.currentHole || 1,
      par: 4,
      distance: 0,
      score: 0,
      putts: 0,
      fairwayHit: false,
      greenInRegulation: false
    };
    return <HoleScoreCardContainer {...props} holeData={defaultData} />;
  }
  
  console.log("Rendering HoleScoreCard with data:", props.holeData);
  console.log("Hole distance:", props.holeData.distance, "yards");
  console.log("Course ID in HoleScoreCard:", props.courseId);
  console.log("Tee ID in HoleScoreCard:", props.teeId);
  return <HoleScoreCardWrapper {...props} />;
};

// Helper component to avoid rendering issues
const HoleScoreCardWrapper = (props: HoleScoreCardProps) => {
  return <HoleScoreCardContainer {...props} />;
};
