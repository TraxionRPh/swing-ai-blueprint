
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HoleNavigation } from "./HoleNavigation";
import { HoleScoreForm } from "./HoleScoreForm";
import { HoleSavingIndicator } from "./HoleSavingIndicator";
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
  // Handle field updates by creating an adapter function
  const handleFieldUpdate = (field: keyof HoleData, value: any) => {
    const updatedData = { ...holeData, [field]: value };
    onUpdate(updatedData);
  };
  
  return (
    <>
      <Card className="w-full max-w-xl mx-auto bg-card border border-border shadow-md animate-in fade-in duration-300">
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-3xl font-bold text-foreground">Hole {holeData.holeNumber}</h3>
            <div className="flex flex-col items-end">
              {teeColor && (
                <span className="text-sm text-muted-foreground">
                  Tee color: <span className="font-medium">{teeColor}</span>
                </span>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Par: <span className="text-foreground">{holeData.par || 4}</span>
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  • <span className="text-foreground">{holeData.distance || 0}</span> yards
                </span>
              </div>
            </div>
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
