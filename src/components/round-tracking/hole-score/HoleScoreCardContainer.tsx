
import React from "react";
import { HoleScoreCardWrapper } from "./HoleScoreCardWrapper";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreCardContainerProps {
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

export const HoleScoreCardContainer = ({
  holeData,
  onUpdate,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSaving,
  currentHole,
  holeCount,
  teeColor,
  courseId,
  teeId
}: HoleScoreCardContainerProps) => {
  console.log("HoleScoreCardContainer rendering with:", {
    holeNumber: holeData?.holeNumber,
    par: holeData?.par,
    distance: holeData?.distance,
    teeColor,
    courseId,
    teeId
  });

  // Ensure we have valid hole data
  const safeHoleData: HoleData = {
    holeNumber: holeData?.holeNumber || 1,
    par: holeData?.par ?? 4,
    distance: holeData?.distance ?? 0,
    score: holeData?.score ?? 0,
    putts: holeData?.putts ?? 0,
    fairwayHit: !!holeData?.fairwayHit,
    greenInRegulation: !!holeData?.greenInRegulation
  };

  const handleFieldUpdate = (field: keyof HoleData, value: any) => {
    const updatedData = { ...safeHoleData, [field]: value };
    onUpdate(updatedData);
  };

  return (
    <HoleScoreCardWrapper
      holeData={safeHoleData}
      onUpdate={handleFieldUpdate}
      onNext={onNext}
      onPrevious={onPrevious}
      isFirst={isFirst}
      isLast={isLast}
      isSaving={isSaving}
      currentHole={currentHole}
      holeCount={holeCount}
    />
  );
};
