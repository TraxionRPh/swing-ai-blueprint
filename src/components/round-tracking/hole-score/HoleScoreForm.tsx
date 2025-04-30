
import React from "react";
import { HoleStats } from "./HoleStats";
import { PerformanceToggles } from "./PerformanceToggles";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreFormProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: any) => void;
}

export const HoleScoreForm = ({ data, onDataChange }: HoleScoreFormProps) => {
  const handleDataChange = (field: keyof HoleData, value: any) => {
    console.log(`HoleScoreForm: Field ${field} changed to ${value} for hole ${data.holeNumber}`);
    onDataChange(field, value);
  };
  
  return (
    <div className="space-y-4">
      <HoleStats data={data} onDataChange={handleDataChange} />
      <PerformanceToggles data={data} onDataChange={handleDataChange} />
    </div>
  );
};
