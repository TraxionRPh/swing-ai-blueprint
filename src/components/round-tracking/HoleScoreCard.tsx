
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { HoleNavigation } from "./hole-score/HoleNavigation";
import { HoleStats } from "./hole-score/HoleStats";
import { PerformanceToggles } from "./hole-score/PerformanceToggles";
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

  const handleNext = () => {
    if (onNext) onNext();
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Hole {data.holeNumber}</h3>
          </div>

          <HoleStats data={data} onDataChange={handleChange} />
          <PerformanceToggles data={data} onDataChange={handleChange} />
          <HoleNavigation 
            onNext={handleNext}
            onPrevious={onPrevious}
            isFirst={isFirst}
            isLast={isLast}
          />
        </CardContent>
      </Card>
      
      {(isSaving || localIsSaving) && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center bg-primary/10 text-primary px-3 py-2 rounded-md">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm font-medium">Saving...</span>
          </div>
        </div>
      )}
    </>
  );
};
