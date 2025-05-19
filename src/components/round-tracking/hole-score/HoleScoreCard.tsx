
import React from "react";
import { HoleScoreCardContainer } from "./HoleScoreCardContainer";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreCardProps {
  holeData: HoleData;
  onUpdate: (data: HoleData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onReviewRound?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSaving?: boolean;
  saveSuccess?: boolean;
  saveError?: string | null;
  currentHole?: number;
  holeCount?: number;
  teeColor?: string;
  courseId?: string;
  teeId?: string;
}

export const HoleScoreCard = (props: HoleScoreCardProps) => {
  // Ensure holeData is always defined with valid defaults
  const safeHoleData: HoleData = {
    holeNumber: props.holeData?.holeNumber || 1,
    par: props.holeData?.par ?? 4,
    distance: props.holeData?.distance ?? 0,
    score: props.holeData?.score ?? 0,
    putts: props.holeData?.putts ?? 0,
    fairwayHit: !!props.holeData?.fairwayHit,
    greenInRegulation: !!props.holeData?.greenInRegulation
  };
  
  console.log("Rendering HoleScoreCard with data:", safeHoleData);
  console.log("Hole distance:", safeHoleData.distance, "yards");
  console.log("Course ID in HoleScoreCard:", props.courseId);
  console.log("Tee ID in HoleScoreCard:", props.teeId);
  console.log("Save status in HoleScoreCard:", { 
    isSaving: props.isSaving,
    saveSuccess: props.saveSuccess,
    saveError: props.saveError
  });
  
  return <HoleScoreCardContainer {...props} holeData={safeHoleData} />;
};
