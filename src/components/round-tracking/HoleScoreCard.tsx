
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
        }, 100);
      } catch (err) {
        console.error("Error preparing data for save:", err);
        toast({
          title: "Error Saving Data",
          description: "There was a problem saving your score. Please try again.",
          variant: "destructive"
        });
        // Don't navigate if there was an error
      }
    } else {
      console.warn("No prepareForSave function available");
      // Fall back to direct navigation if no save function is available
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
        }, 100);
      } catch (err) {
        console.error("Error preparing data for save:", err);
        toast({
          title: "Error Saving Data",
          description: "There was a problem saving your score. Please try again.",
          variant: "destructive"
        });
        // Don't navigate if there was an error
      }
    } else {
      console.warn("No prepareForSave function available");
      // Fall back to direct navigation if no save function is available
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
    
    // Special handling for the prepareForSave function
    if (field === 'prepareForSave' as keyof HoleData) {
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
    
    // Pass ALL field updates to parent to ensure they're available for navigation
    // Exclude the prepareForSave function which is handled differently
    onUpdate(newData);
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
