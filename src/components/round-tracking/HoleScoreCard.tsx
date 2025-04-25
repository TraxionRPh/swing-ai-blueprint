
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HoleData {
  holeNumber: number;
  par: number;
  distance: number;
  score: number;
  putts: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
  courseId?: string;
}

interface HoleScoreCardProps {
  holeData: HoleData;
  onUpdate: (data: HoleData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
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
  teeColor,
  courseId
}: HoleScoreCardProps) => {
  const [data, setData] = useState<HoleData>(holeData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setData(holeData);
  }, [holeData.holeNumber]);
  
  const saveCourseHoleData = async (field: 'par' | 'distance', value: number) => {
    if (!courseId) return;
    
    setIsSaving(true);
    try {
      // Always include both par and distance when updating
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

      toast({
        title: "Course data saved",
        description: "This information will be available for future rounds"
      });
    } catch (error) {
      console.error('Error saving course hole data:', error);
      toast({
        title: "Error saving course data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof HoleData, value: any) => {
    const newData = {
      ...data,
      [field]: value
    };
    setData(newData);
    onUpdate(newData);

    if ((field === 'par' || field === 'distance') && courseId) {
      saveCourseHoleData(field, value);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Hole {data.holeNumber}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="par">Par</Label>
            <Input id="par" type="number" placeholder="Enter par" value={data.par || ''} onChange={e => handleChange('par', parseInt(e.target.value) || 0)} min={3} max={6} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance">Yards</Label>
            <Input id="distance" type="number" placeholder="Enter yards" value={data.distance || ''} onChange={e => handleChange('distance', parseInt(e.target.value) || 0)} min={0} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score</Label>
            <Input id="score" type="number" placeholder="Enter score" value={data.score || ''} onChange={e => handleChange('score', parseInt(e.target.value) || 0)} min={1} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="putts">Putts</Label>
            <Input id="putts" type="number" placeholder="Enter putts" value={data.putts || ''} onChange={e => handleChange('putts', parseInt(e.target.value) || 0)} min={0} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="fairway">Fairway Hit</Label>
            <Switch id="fairway" checked={data.fairwayHit} onCheckedChange={checked => handleChange('fairwayHit', checked)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="gir">Green in Regulation</Label>
            <Switch id="gir" checked={data.greenInRegulation} onCheckedChange={checked => handleChange('greenInRegulation', checked)} />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
            Previous Hole
          </Button>
          <Button onClick={onNext} disabled={isLast}>
            Next Hole
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
