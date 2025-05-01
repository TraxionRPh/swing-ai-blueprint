
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface HoleHeaderProps {
  holeNumber: number;
  par?: number;
  distance?: number;
  onParChange?: (par: number) => void;
}

export const HoleHeader = ({ holeNumber, par, distance, onParChange }: HoleHeaderProps) => {
  // Add defensive checks to handle undefined values
  const safeHoleNumber = holeNumber || 1;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">Hole {safeHoleNumber}</div>
        <div className="flex items-center space-x-3">
          {distance !== undefined && distance > 0 && (
            <span className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {distance} yards
            </span>
          )}
        </div>
      </div>
      
      {onParChange && (
        <div className="space-y-1">
          <div className="text-sm font-medium">Select Par</div>
          <ToggleGroup 
            type="single" 
            value={par?.toString() || "4"}
            onValueChange={(value) => {
              if (value) onParChange(parseInt(value));
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="3" aria-label="Par 3" className="flex-1">
              Par 3
            </ToggleGroupItem>
            <ToggleGroupItem value="4" aria-label="Par 4" className="flex-1">
              Par 4
            </ToggleGroupItem>
            <ToggleGroupItem value="5" aria-label="Par 5" className="flex-1">
              Par 5
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    </div>
  );
};
