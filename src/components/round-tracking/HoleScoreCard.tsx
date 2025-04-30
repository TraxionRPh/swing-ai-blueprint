
import React from "react";
import { HoleScoreCardContainer } from "./hole-score/HoleScoreCardContainer";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreCardProps {
  holeData: HoleData;
  onUpdate: (data: HoleData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  teeColor?: string;
  courseId?: string;
  isSaving?: boolean;
}

export const HoleScoreCard = (props: HoleScoreCardProps) => {
  return <HoleScoreCardContainer {...props} />;
};
