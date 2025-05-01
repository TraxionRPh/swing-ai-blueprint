
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreFormProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: any) => void;
}

export const HoleScoreForm = ({ data, onDataChange }: HoleScoreFormProps) => {
  const [formData, setFormData] = useState<HoleData>(data);
  
  // Update form when data prop changes
  useEffect(() => {
    setFormData(data);
  }, [data.holeNumber, data.par, data.distance]);
  
  // Handle input changes
  const handleInputChange = (field: keyof HoleData, value: any) => {
    let parsedValue = value;
    
    // Convert string numbers to actual numbers
    if (field === 'par' || field === 'distance' || field === 'score' || field === 'putts') {
      parsedValue = value === '' ? 0 : parseInt(value, 10);
      
      // Validate the number
      if (isNaN(parsedValue)) {
        parsedValue = 0;
      }
    }
    
    // Update local state
    setFormData(prev => ({
      ...prev,
      [field]: parsedValue
    }));
    
    // Notify parent with debounced update
    onDataChange(field, parsedValue);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="par">Par</Label>
          <Input
            id="par"
            type="number"
            min={3}
            max={6}
            value={formData.par}
            onChange={(e) => handleInputChange('par', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="distance">Distance (yards)</Label>
          <Input
            id="distance"
            type="number"
            min={0}
            value={formData.distance}
            onChange={(e) => handleInputChange('distance', e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                min={1}
                value={formData.score || ''}
                onChange={(e) => handleInputChange('score', e.target.value)}
                placeholder="Enter score"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="putts">Putts</Label>
              <Input
                id="putts"
                type="number"
                min={0}
                value={formData.putts || ''}
                onChange={(e) => handleInputChange('putts', e.target.value)}
                placeholder="Enter putts"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fairwayHit"
                checked={!!formData.fairwayHit}
                onCheckedChange={(checked) => handleInputChange('fairwayHit', checked)}
              />
              <Label htmlFor="fairwayHit">Hit Fairway</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="greenInRegulation"
                checked={!!formData.greenInRegulation}
                onCheckedChange={(checked) => handleInputChange('greenInRegulation', checked)}
              />
              <Label htmlFor="greenInRegulation">Green in Regulation</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
