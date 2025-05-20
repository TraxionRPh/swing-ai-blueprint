
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

  // Ensure data has valid default values if properties are undefined
  const safeData = {
    ...data,
    holeNumber: data.holeNumber || 1,
    par: data.par ?? 4,
    score: data.score ?? 0,
    putts: data.putts, // No default value, allow it to be undefined
    fairwayHit: !!data.fairwayHit,
    greenInRegulation: !!data.greenInRegulation,
    distance: data.distance ?? 0
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onDataChange("score", isNaN(value) ? 0 : value);
  };

  const handlePuttsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onDataChange("putts", isNaN(value) ? undefined : value);
  };

  const handleParChange = (value: number) => {
    onDataChange("par", value);
  };

  const handleFairwayToggle = (value: boolean) => {
    onDataChange("fairwayHit", value);
  };

  const handleGirToggle = (value: boolean) => {
    onDataChange("greenInRegulation", value);
  };

  return (
    <div className="space-y-4">
      <HoleHeader 
        holeNumber={safeData.holeNumber} 
        par={safeData.par} 
        distance={safeData.distance}
        onParChange={handleParChange}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="score" className="block text-sm font-medium mb-1">
            Score
          </label>
          <Input
            id="score"
            type="number"
            value={safeData.score || ""}
            onChange={handleScoreChange}
            min={0}
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="putts" className="block text-sm font-medium mb-1">
            Putts
            <span className="text-xs text-gray-500 ml-1">(0 for chip-in)</span>
          </label>
          <Input
            id="putts"
            type="number"
            value={safeData.putts !== undefined ? safeData.putts : ""}
            onChange={handlePuttsChange}
            min={0}
            className="w-full"
          />
        </div>
      </div>
      
      <PerformanceToggles
        fairwayHit={safeData.fairwayHit}
        greenInRegulation={safeData.greenInRegulation}
        onFairwayToggle={handleFairwayToggle}
        onGirToggle={handleGirToggle}
      />
      
      <HoleStats
        par={safeData.par}
        score={safeData.score}
        putts={safeData.putts}
      />
    </div>
  );
};
