
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { HoleScoreCardWrapper } from "./HoleScoreCardWrapper";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreCardContainerProps {
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

export const HoleScoreCardContainer = ({
  holeData,
  onUpdate,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  teeColor,
  courseId,
  isSaving = false
}: HoleScoreCardContainerProps) => {
  const [data, setData] = useState<HoleData>(holeData);
  const [localIsSaving, setLocalIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Update local state when hole data changes (only for hole number changes)
  useEffect(() => {
    if (data.holeNumber !== holeData.holeNumber) {
      console.log("HoleScoreCard: Hole number changed:", holeData.holeNumber);
      setData(holeData);
    }
  }, [holeData.holeNumber]);
  
  // Also update local state when important hole data changes
  useEffect(() => {
    setData(prev => ({
      ...prev,
      score: holeData.score,
      putts: holeData.putts,
      fairwayHit: holeData.fairwayHit,
      greenInRegulation: holeData.greenInRegulation
    }));
  }, [holeData.score, holeData.putts, holeData.fairwayHit, holeData.greenInRegulation]);

  // Navigation handlers that save data before navigating
  const handleNextHole = async () => {
    if (localIsSaving) return;
    
    console.log(`Next hole handler called for hole ${data.holeNumber}`);
    setLocalIsSaving(true);
    
    try {
      // Update the parent component with complete data
      await onUpdate(data);
      
      // Add a small delay to ensure the data is saved
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Then call the parent's next function
      if (typeof onNext === 'function') {
        console.log("Calling navigation handler after data save");
        onNext();
      }
    } catch (err) {
      console.error("Error preparing data for save:", err);
      toast({
        title: "Error Saving Data",
        description: "There was a problem saving your score. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLocalIsSaving(false);
    }
  };
  
  const handlePreviousHole = async () => {
    if (localIsSaving) return;
    
    console.log(`Previous hole handler called for hole ${data.holeNumber}`);
    setLocalIsSaving(true);
    
    try {
      // Update the parent component with complete data
      await onUpdate(data);
      
      // Add a small delay to ensure the data is saved
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Then call the parent's previous function
      if (typeof onPrevious === 'function') {
        console.log("Calling navigation handler after data save");
        onPrevious();
      }
    } catch (err) {
      console.error("Error preparing data for save:", err);
      toast({
        title: "Error Saving Data",
        description: "There was a problem saving your score. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLocalIsSaving(false);
    }
  };

  const handleChange = (field: keyof HoleData, value: any) => {
    console.log(`HoleScoreCard: Updating field ${field} to ${value} for hole ${data.holeNumber}`);
    
    // Update local state
    const newData = { ...data, [field]: value };
    setData(newData);
    
    // Force immediate update to parent for ALL fields to prevent data loss
    onUpdate(newData);
  };

  return (
    <HoleScoreCardWrapper 
      holeData={data}
      onUpdate={handleChange}
      onNext={handleNextHole}
      onPrevious={handlePreviousHole}
      isFirst={isFirst}
      isLast={isLast}
      isSaving={isSaving || localIsSaving}
    />
  );
};
