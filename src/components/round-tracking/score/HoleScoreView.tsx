
import { HoleScoreCard } from "@/components/round-tracking/HoleScoreCard";
import { ScoreSummary } from "@/components/round-tracking/ScoreSummary";
import type { HoleData } from "@/types/round-tracking";
import { useEffect, useState, useRef } from "react";

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
  const initializedRef = useRef(false);
  
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
    // Always ensure we have a valid data object for the current hole
    const matchingHole = holeScores.find(hole => hole.holeNumber === currentHole);
    
    if (matchingHole) {
      setValidatedData(matchingHole);
      initializedRef.current = true;
    } else if (currentHoleData && currentHoleData.holeNumber === currentHole) {
      setValidatedData(currentHoleData);
      initializedRef.current = true;
    } else {
      // If we still don't have data after 2 seconds, create default data
      if (!initializedRef.current) {
        const timer = setTimeout(() => {
          if (!initializedRef.current) {
            console.log(`Creating default data for hole ${currentHole} as fallback`);
            setValidatedData(createDefaultHoleData(currentHole));
            initializedRef.current = true;
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
    
    console.log(`HoleScoreView - Displaying hole ${currentHole}`, 
      matchingHole || currentHoleData || "Using default data");
      
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
    </>
  );
};
