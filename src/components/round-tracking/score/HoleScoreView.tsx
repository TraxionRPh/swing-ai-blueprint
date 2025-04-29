
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import type { HoleData } from "@/types/round-tracking";
import { useEffect, useState, useRef } from "react";
import { HoleSavingIndicator } from "@/components/round-tracking/hole-score/HoleSavingIndicator";

interface HoleScoreViewProps {
  currentHoleData: HoleData;
  handleHoleUpdate: (data: HoleData) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  currentHole: number;
  holeCount: number;
  teeColor?: string;
  courseId?: string;
  isSaving: boolean;
  holeScores: HoleData[];
}

export const HoleScoreView = ({
  currentHoleData,
  handleHoleUpdate,
  handleNext,
  handlePrevious,
  currentHole,
  holeCount,
  teeColor,
  courseId,
  isSaving,
  holeScores
}: HoleScoreViewProps) => {
  // Make sure we always have valid hole data that matches the current hole
  const [validatedData, setValidatedData] = useState<HoleData>(currentHoleData);
  const updateBlockedRef = useRef(false);
  
  // Create a default hole data object function
  const createDefaultHoleData = (holeNumber: number): HoleData => ({
    holeNumber,
    par: 4,
    distance: 0,
    score: 0,
    putts: 0,
    fairwayHit: false,
    greenInRegulation: false
  });
  
  useEffect(() => {
    // Skip processing if update is blocked
    if (updateBlockedRef.current) return;
    
    // Block updates briefly
    updateBlockedRef.current = true;
    
    // Always ensure we have a valid data object for the current hole
    const matchingHole = holeScores.find(hole => hole.holeNumber === currentHole);
    
    if (matchingHole) {
      setValidatedData(matchingHole);
    } else if (currentHoleData && currentHoleData.holeNumber === currentHole) {
      setValidatedData(currentHoleData);
    } else {
      // Create default data immediately if we don't have matching data
      setValidatedData(createDefaultHoleData(currentHole));
    }
    
    // Unblock updates after a short delay
    setTimeout(() => {
      updateBlockedRef.current = false;
    }, 300);
  }, [currentHole, currentHoleData, holeScores]);
    
  return (
    <>
      {holeScores.length > 0 && (
        <ScoreSummary holeScores={holeScores.slice(0, holeCount)} />
      )}
      
      <HoleScoreCard
        holeData={validatedData}
        onUpdate={handleHoleUpdate}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirst={currentHole === 1}
        isLast={currentHole === holeCount}
        teeColor={teeColor}
        courseId={courseId}
        isSaving={isSaving}
      />
      
      {/* Add saving indicator to show when data is being saved */}
      <HoleSavingIndicator isSaving={isSaving} />
    </>
  );
};
