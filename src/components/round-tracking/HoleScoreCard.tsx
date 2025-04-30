
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
  const formRefs = useRef<{ prepareForSave?: () => void }>({});
  
  // Update local state when hole data changes (only for hole number changes)
  useEffect(() => {
    if (data.holeNumber !== holeData.holeNumber) {
      console.log("HoleScoreCard: Hole number changed:", holeData.holeNumber);
      setData(holeData);
    }
  }, [holeData.holeNumber]);

  // Navigation handlers that ONLY save data before navigating
  const handleNextHole = () => {
    console.log(`Next hole handler called for hole ${data.holeNumber}`);
    
    // First collect any pending form data using the exposed function
    if (typeof formRefs.current.prepareForSave === 'function') {
      formRefs.current.prepareForSave();
    }
    
    // Then update the parent component with current data
    onUpdate(data);
    
    // Then call the parent's next function
    if (typeof onNext === 'function') {
      onNext();
    }
  };
  
  const handlePreviousHole = () => {
    console.log(`Previous hole handler called for hole ${data.holeNumber}`);
    
    // First collect any pending form data using the exposed function
    if (typeof formRefs.current.prepareForSave === 'function') {
      formRefs.current.prepareForSave();
    }
    
    // Then update the parent component with current data
    onUpdate(data);
    
    // Then call the parent's previous function
    if (typeof onPrevious === 'function') {
      onPrevious();
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
          <HoleScoreForm data={{...data, prepareForSave: () => {}}} onDataChange={handleChange} />
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
