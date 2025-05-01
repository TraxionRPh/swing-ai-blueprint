
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
    
    // Notify parent with update
    onDataChange(field, parsedValue);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="par" className="text-lg font-medium text-foreground">Par</Label>
        <div className="flex space-x-2">
          {[3, 4, 5].map(parValue => (
            <Button 
              key={parValue}
              type="button"
              variant={formData.par === parValue ? "default" : "outline"}
              onClick={() => handleInputChange('par', parValue)}
              className="flex-1 px-4 py-2 text-lg"
            >
              {parValue}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="distance" className="text-lg font-medium text-foreground">Yards</Label>
        <Input
          id="distance"
          type="number"
          min={0}
          value={formData.distance || ''}
          onChange={(e) => handleInputChange('distance', e.target.value)}
          placeholder="Enter yards"
          className="text-lg"
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="score" className="text-lg font-medium text-foreground">Score</Label>
        <Input
          id="score"
          type="number"
          min={1}
          value={formData.score || ''}
          onChange={(e) => handleInputChange('score', e.target.value)}
          placeholder="Enter score"
          className="text-lg"
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="putts" className="text-lg font-medium text-foreground">Putts</Label>
        <Input
          id="putts"
          type="number"
          min={0}
          value={formData.putts || ''}
          onChange={(e) => handleInputChange('putts', e.target.value)}
          placeholder="Enter putts"
          className="text-lg"
        />
      </div>
      
      <div className="space-y-3 pt-2">
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="fairwayHit"
            checked={!!formData.fairwayHit}
            onCheckedChange={(checked) => handleInputChange('fairwayHit', checked)}
          />
          <Label htmlFor="fairwayHit" className="text-lg">Hit Fairway</Label>
        </div>
        
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="greenInRegulation"
            checked={!!formData.greenInRegulation}
            onCheckedChange={(checked) => handleInputChange('greenInRegulation', checked)}
          />
          <Label htmlFor="greenInRegulation" className="text-lg">Green in Regulation</Label>
        </div>
      </div>
    </div>
  );
};
