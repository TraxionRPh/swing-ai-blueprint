
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HoleNavigation } from "./HoleNavigation";
import { HoleScoreForm } from "./HoleScoreForm";
import { HoleSavingIndicator } from "./HoleSavingIndicator";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreCardProps {
  holeData: HoleData;
  onUpdate: (field: keyof HoleData, value: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isSaving?: boolean;
  currentHole?: number;
  holeCount?: number;
  teeColor?: string;
  courseId?: string;
}

export const HoleScoreCard = ({
  holeData,
  onUpdate,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  isSaving = false,
  currentHole,
  holeCount,
  teeColor,
  courseId
}: HoleScoreCardProps) => {
  // Handle field updates
  const handleFieldUpdate = (field: keyof HoleData, value: any) => {
    const updatedData = { ...holeData, [field]: value };
    onUpdate(updatedData);
  };
  
  return (
    <>
      <Card className="w-full max-w-xl mx-auto bg-primary-foreground/10 border-none">
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl font-bold">Hole {holeData.holeNumber}</h3>
            {teeColor && (
              <span className="text-sm text-muted-foreground">
                Tee color: {teeColor}
              </span>
            )}
          </div>
          
          <HoleScoreForm 
            data={holeData} 
            onDataChange={handleFieldUpdate} 
          />
          
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
