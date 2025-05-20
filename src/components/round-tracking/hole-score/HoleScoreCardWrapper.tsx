
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
  onReviewRound?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSaving?: boolean;
  saveSuccess?: boolean;
  saveError?: string | null;
  currentHole?: number;
  holeCount?: number;
}

export const HoleScoreCardWrapper = ({
  holeData,
  onUpdate,
  onNext,
  onPrevious,
  onReviewRound,
  isFirst,
  isLast,
  isSaving = false,
  saveSuccess = false,
  saveError = null,
  currentHole,
  holeCount
}: HoleScoreCardWrapperProps) => {
  // Final safety check to ensure holeData is valid
  const safeData: HoleData = {
    holeNumber: holeData?.holeNumber || 1,
    par: holeData?.par ?? 4,
    distance: holeData?.distance ?? 0,
    score: holeData?.score ?? 0,
    putts: holeData?.putts, // Keep putts as undefined if it's undefined
    fairwayHit: !!holeData?.fairwayHit,
    greenInRegulation: !!holeData?.greenInRegulation
  };
  
  console.log("HoleScoreCardWrapper save status:", { isSaving, saveSuccess, saveError });
  
  return (
    <>
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="pt-6 space-y-4">
          <HoleScoreForm data={safeData} onDataChange={onUpdate} />
          <HoleNavigation 
            onNext={onNext}
            onPrevious={onPrevious}
            onReviewRound={onReviewRound}
            isFirst={isFirst}
            isLast={isLast}
            currentHole={currentHole}
            holeCount={holeCount}
          />
        </CardContent>
      </Card>
      
      <HoleSavingIndicator 
        isSaving={isSaving} 
        saveSuccess={saveSuccess}
        saveError={saveError}
      />
    </>
  );
};
