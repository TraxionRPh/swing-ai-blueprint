import React, { useState, useEffect } from "react";
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
  
  useEffect(() => {
    setData(holeData);
  }, [holeData.holeNumber]);

  // Improved navigation handlers with direct forwarding and thorough logging
  const handleNextHole = () => {
    console.log(`Next hole handler called in HoleScoreCard for hole ${holeData.holeNumber}`);
    
    // Check if the handler exists and is a function
    if (typeof onNext === 'function') {
      console.log("Calling provided onNext function");
      
      // Directly invoke the parent handler
      onNext();
    } else {
      console.warn("No onNext handler provided to HoleScoreCard");
    }
  };
  
  const handlePreviousHole = () => {
    console.log(`Previous hole handler called in HoleScoreCard for hole ${holeData.holeNumber}`);
    
    // Check if the handler exists and is a function
    if (typeof onPrevious === 'function') {
      console.log("Calling provided onPrevious function");
      
      // Directly invoke the parent handler
      onPrevious();
    } else {
      console.warn("No onPrevious handler provided to HoleScoreCard");
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
    const newData = { ...data, [field]: value };
    setData(newData);
    onUpdate(newData);

    if ((field === 'par' || field === 'distance') && courseId) {
      saveCourseHoleData(field, value);
    }
  };

  return (
    <>
      <Card className="w-full max-w-xl mx-auto">
        <CardContent className="pt-6 space-y-4">
          <HoleHeader holeNumber={data.holeNumber} />
          <HoleScoreForm data={data} onDataChange={handleChange} />
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
