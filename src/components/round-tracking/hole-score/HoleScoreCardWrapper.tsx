
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HoleNavigation } from "./HoleNavigation";
import { HoleScoreForm } from "./HoleScoreForm";
import { HoleSavingIndicator } from "./HoleSavingIndicator";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreCardWrapperProps {
  holeData: HoleData;
  onUpdate: (field: keyof HoleData, value: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSaving?: boolean;
  currentHole?: number;
  holeCount?: number;
}

export const HoleScoreCardWrapper = ({
  holeData,
  onUpdate,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSaving = false,
  currentHole,
  holeCount
}: HoleScoreCardWrapperProps) => {
  // Final safety check to ensure holeData is valid
  const safeData: HoleData = {
    holeNumber: holeData?.holeNumber || 1,
    par: holeData?.par ?? 4,
    distance: holeData?.distance ?? 0,
    score: holeData?.score ?? 0,
    putts: holeData?.putts ?? 0,
    fairwayHit: !!holeData?.fairwayHit,
    greenInRegulation: !!holeData?.greenInRegulation
  };
  
  return (
    <>
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="pt-6 space-y-4">
          <HoleScoreForm data={safeData} onDataChange={onUpdate} />
          <HoleNavigation 
            onNext={onNext}
            onPrevious={onPrevious}
            isFirst={isFirst}
            isLast={isLast}
            currentHole={currentHole}
            holeCount={holeCount}
          />
        </CardContent>
      </Card>
      
      <HoleSavingIndicator isSaving={isSaving} />
    </>
  );
};
