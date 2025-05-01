
import React, { useState } from "react";
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
    holeNumber: holeData.holeNumber,
    par: holeData.par,
    distance: holeData.distance,
    teeColor,
    courseId,
    teeId
  });

  const handleFieldUpdate = (field: keyof HoleData, value: any) => {
    const updatedData = { ...holeData, [field]: value };
    onUpdate(updatedData);
  };

  return (
    <HoleScoreCardWrapper
      holeData={holeData}
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
