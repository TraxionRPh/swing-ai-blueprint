
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
  console.log("Rendering HoleScoreCard with data:", props.holeData);
  return <HoleScoreCardContainer {...props} />;
};
