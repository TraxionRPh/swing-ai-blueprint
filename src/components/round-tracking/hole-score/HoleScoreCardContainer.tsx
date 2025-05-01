
import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  currentHole?: number;
  holeCount?: number;
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
  isSaving = false,
  currentHole,
  holeCount
}: HoleScoreCardContainerProps) => {
  const [data, setData] = useState<HoleData>(holeData);
  const [localIsSaving, setLocalIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { toast } = useToast();
  const formRefs = useRef<{ prepareForSave?: () => HoleData }>({});
  
  // Update local state when hole data changes (only for hole number changes)
  useEffect(() => {
    if (data.holeNumber !== holeData.holeNumber) {
      console.log("HoleScoreCard: Hole number changed:", holeData.holeNumber);
      setData(holeData);
    }
  }, [holeData.holeNumber]);
  
  // Also update local state when important hole data changes
  useEffect(() => {
    if (!isNavigating) {
      console.log("HoleScoreCard: Score or putts changed, updating local data");
      setData(prev => ({
        ...prev,
        score: holeData.score,
        putts: holeData.putts
      }));
    }
  }, [holeData.score, holeData.putts, isNavigating]);

  // Navigation handlers that explicitly save data before navigating
  const handleNextHole = async () => {
    if (isNavigating) return;
    
    console.log(`Next hole handler called for hole ${data.holeNumber}`);
    setIsNavigating(true);
    setLocalIsSaving(true);
    
    try {
      // First collect any pending form data using the exposed function
      if (typeof formRefs.current.prepareForSave === 'function') {
        const completeData = formRefs.current.prepareForSave();
        console.log("Complete data prepared for saving:", completeData);
        
        // Then update the parent component with complete data
        // This should trigger the saveHoleScore function in the parent
        await onUpdate(completeData);
        
        // Add a delay to ensure the data is saved before navigation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Then call the parent's next function
        if (typeof onNext === 'function') {
          console.log("Calling navigation handler after data save");
          onNext();
        }
      } else {
        console.warn("No prepareForSave function available");
        // Fall back to direct navigation if no save function is available
        if (typeof onNext === 'function') onNext();
      }
    } catch (err) {
      console.error("Error preparing data for save:", err);
      toast({
        title: "Error Saving Data",
        description: "There was a problem saving your score. Please try again.",
        variant: "destructive"
      });
      // Don't navigate if there was an error
    } finally {
      setIsNavigating(false);
      setLocalIsSaving(false);
    }
  };
  
  const handlePreviousHole = async () => {
    if (isNavigating) return;
    
    console.log(`Previous hole handler called for hole ${data.holeNumber}`);
    setIsNavigating(true);
    setLocalIsSaving(true);
    
    try {
      // First collect any pending form data using the exposed function
      if (typeof formRefs.current.prepareForSave === 'function') {
        const completeData = formRefs.current.prepareForSave();
        console.log("Complete data prepared for saving:", completeData);
        
        // Then update the parent component with complete data
        await onUpdate(completeData);
        
        // Add a delay to ensure the data is saved before navigation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Then call the parent's previous function
        if (typeof onPrevious === 'function') {
          console.log("Calling navigation handler after data save");
          onPrevious();
        }
      } else {
        console.warn("No prepareForSave function available");
        // Fall back to direct navigation if no save function is available
        if (typeof onPrevious === 'function') onPrevious();
      }
    } catch (err) {
      console.error("Error preparing data for save:", err);
      toast({
        title: "Error Saving Data",
        description: "There was a problem saving your score. Please try again.",
        variant: "destructive"
      });
      // Don't navigate if there was an error
    } finally {
      setIsNavigating(false);
      setLocalIsSaving(false);
    }
  };

  const handleChange = (field: keyof HoleData, value: any) => {
    console.log(`HoleScoreCard: Updating field ${field} to ${value} for hole ${data.holeNumber}`);
    
    // Special handling for the prepareForSave function
    if (field === 'prepareForSave' as any) {
      console.log("Registering prepareForSave function");
      formRefs.current.prepareForSave = value;
      return;
    }
    
    // Update local state
    const newData = { ...data, [field]: value };
    setData(newData);
    
    // Update course hole data for par and distance immediately
    // These are the only fields that need immediate saving
    if ((field === 'par' || field === 'distance') && courseId) {
      saveCourseHoleData(field, value);
    }
    
    // Force immediate update to parent for ALL fields to prevent data loss
    onUpdate(newData);
  };
  
  const saveCourseHoleData = async (field: 'par' | 'distance', value: number) => {
    if (!courseId) return;
    
    setLocalIsSaving(true);
    try {
      const updateData = {
        course_id: courseId,
        hole_number: data.holeNumber,
        par: field === 'par' ? value : data.par,
        distance_yards: field === 'distance' ? value : data.distance
      };

      console.log('Saving course hole data:', updateData);
      
      const { error } = await supabase
        .from('course_holes')
        .upsert(updateData, {
          onConflict: 'course_id,hole_number'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving course hole data:', error);
      toast({
        title: "Error saving course data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLocalIsSaving(false);
    }
  };

  // Create a forwarding function to adapt between the two expected function signatures
  const handleUpdateAdapter = (fieldOrData: keyof HoleData | HoleData, value?: any) => {
    if (typeof fieldOrData === 'object') {
      // If it's an object, it's a full HoleData object
      onUpdate(fieldOrData as HoleData);
    } else {
      // Otherwise it's a field update
      handleChange(fieldOrData as keyof HoleData, value);
    }
  };

  return (
    <HoleScoreCardWrapper 
      holeData={data}
      onUpdate={handleUpdateAdapter}
      onNext={handleNextHole}
      onPrevious={handlePreviousHole}
      isFirst={isFirst}
      isLast={isLast}
      isSaving={isSaving || localIsSaving || isNavigating}
      currentHole={currentHole}
      holeCount={holeCount}
    />
  );
};
