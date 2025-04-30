
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HoleNavigation } from "./hole-score/HoleNavigation";
import { HoleHeader } from "./hole-score/HoleHeader";
import { HoleScoreForm } from "./hole-score/HoleScoreForm";
import { HoleSavingIndicator } from "./hole-score/HoleSavingIndicator";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreCardProps {
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

export const HoleScoreCard = ({
  holeData,
  onUpdate,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  teeColor,
  courseId,
  isSaving = false
}: HoleScoreCardProps) => {
  const [data, setData] = useState<HoleData>(holeData);
  const [localIsSaving, setLocalIsSaving] = useState(false);
  const { toast } = useToast();
  const formRefs = useRef<{ prepareForSave?: () => HoleData }>({});
  
  // Update local state when hole data changes (only for hole number changes)
  useEffect(() => {
    if (data.holeNumber !== holeData.holeNumber) {
      console.log("HoleScoreCard: Hole number changed:", holeData.holeNumber);
      setData(holeData);
    }
  }, [holeData.holeNumber]);

  // Navigation handlers that explicitly save data before navigating
  const handleNextHole = () => {
    console.log(`Next hole handler called for hole ${data.holeNumber}`);
    
    // First collect any pending form data using the exposed function
    if (typeof formRefs.current.prepareForSave === 'function') {
      try {
        const completeData = formRefs.current.prepareForSave();
        console.log("Complete data prepared for saving:", completeData);
        
        // Then update the parent component with complete data
        onUpdate(completeData);
        
        // Add a small delay to ensure the data is saved before navigation
        setTimeout(() => {
          // Then call the parent's next function
          if (typeof onNext === 'function') {
            console.log("Calling navigation handler after data save");
            onNext();
          }
        }, 50);
      } catch (err) {
        console.error("Error preparing data for save:", err);
        // Still try to navigate even if save fails
        if (typeof onNext === 'function') onNext();
      }
    } else {
      console.warn("No prepareForSave function available");
      // No save function available, just navigate
      if (typeof onNext === 'function') onNext();
    }
  };
  
  const handlePreviousHole = () => {
    console.log(`Previous hole handler called for hole ${data.holeNumber}`);
    
    // First collect any pending form data using the exposed function
    if (typeof formRefs.current.prepareForSave === 'function') {
      try {
        const completeData = formRefs.current.prepareForSave();
        console.log("Complete data prepared for saving:", completeData);
        
        // Then update the parent component with complete data
        onUpdate(completeData);
        
        // Add a small delay to ensure the data is saved before navigation
        setTimeout(() => {
          // Then call the parent's previous function
          if (typeof onPrevious === 'function') {
            console.log("Calling navigation handler after data save");
            onPrevious();
          }
        }, 50);
      } catch (err) {
        console.error("Error preparing data for save:", err);
        // Still try to navigate even if save fails
        if (typeof onPrevious === 'function') onPrevious();
      }
    } else {
      console.warn("No prepareForSave function available");
      // No save function available, just navigate
      if (typeof onPrevious === 'function') onPrevious();
    }
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

  const handleChange = (field: keyof HoleData, value: any) => {
    console.log(`HoleScoreCard: Updating field ${field} to ${value} for hole ${data.holeNumber}`);
    
    // Update local state
    const newData = { ...data, [field]: value };
    
    // Attach the form ref handler to allow collecting data before navigation
    if (field === 'prepareForSave') {
      formRefs.current.prepareForSave = value;
      return;
    }
    
    setData(newData);
    
    // Update course hole data for par and distance immediately
    // These are the only fields that need immediate saving
    if ((field === 'par' || field === 'distance') && courseId) {
      saveCourseHoleData(field, value);
    }
    
    // For score fields, we only update the local state, not notify parent
    // Score and putts will be saved only on navigation
  };

  return (
    <>
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="pt-6 space-y-4">
          <HoleHeader holeNumber={data.holeNumber} />
          <HoleScoreForm data={{...data, prepareForSave: () => ({} as HoleData)}} onDataChange={handleChange} />
          <HoleNavigation 
            onNext={handleNextHole}
            onPrevious={handlePreviousHole}
            isFirst={isFirst}
            isLast={isLast}
          />
        </CardContent>
      </Card>
      
      <HoleSavingIndicator isSaving={isSaving || localIsSaving} />
    </>
  );
};
