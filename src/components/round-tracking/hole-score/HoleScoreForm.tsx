
import React from "react";
import { Input } from "@/components/ui/input";
import { HoleHeader } from "./HoleHeader";
import { HoleStats } from "./HoleStats";
import { PerformanceToggles } from "./PerformanceToggles";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreFormProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: any) => void;
}

export const HoleScoreForm = ({ data, onDataChange }: HoleScoreFormProps) => {
  console.log("HoleScoreForm rendering with data:", data);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onDataChange("score", isNaN(value) ? 0 : value);
  };

  const handlePuttsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onDataChange("putts", isNaN(value) ? 0 : value);
  };

  return (
    <div className="space-y-4">
      <HoleHeader 
        holeNumber={data.holeNumber} 
        par={data.par} 
        distance={data.distance} 
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="score" className="block text-sm font-medium mb-1">
            Score
          </label>
          <Input
            id="score"
            type="number"
            value={data.score || ""}
            onChange={handleScoreChange}
            min={0}
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="putts" className="block text-sm font-medium mb-1">
            Putts
          </label>
          <Input
            id="putts"
            type="number"
            value={data.putts || ""}
            onChange={handlePuttsChange}
            min={0}
            className="w-full"
          />
        </div>
      </div>
      
      <PerformanceToggles
        data={data}
        onDataChange={onDataChange}
      />
      
      <HoleStats
        data={data}
        onDataChange={onDataChange}
      />
    </div>
  );
};
