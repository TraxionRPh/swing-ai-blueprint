
import React, { useState, useEffect } from "react";
import { HoleStats } from "./HoleStats";
import { PerformanceToggles } from "./PerformanceToggles";
import type { HoleData } from "@/types/round-tracking";

interface HoleScoreFormProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: any) => void;
}

export const HoleScoreForm = ({ data, onDataChange }: HoleScoreFormProps) => {
  return (
    <div className="space-y-4">
      <HoleStats data={data} onDataChange={onDataChange} />
      <PerformanceToggles data={data} onDataChange={onDataChange} />
    </div>
  );
};
