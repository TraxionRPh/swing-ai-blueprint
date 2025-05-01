
import React, { useRef, useEffect } from "react";
import type { HoleData } from "@/types/round-tracking";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface HoleStatsProps {
  data: HoleData;
  onDataChange: (field: keyof HoleData, value: any) => void;
}

export const HoleStats = ({ data, onDataChange }: HoleStatsProps) => {
  // References to track form state
  const scoreRef = useRef<HTMLInputElement>(null);
  const yardageRef = useRef<HTMLInputElement>(null);
  const puttsRef = useRef<HTMLInputElement>(null);
  
  // Register a function to collect all form data before saving
  useEffect(() => {
    onDataChange('prepareForSave', () => {
      // Collect all values from form inputs
      const updatedData = { ...data };
      
      // Get score value
      if (scoreRef.current) {
        const scoreVal = parseInt(scoreRef.current.value, 10);
        if (!isNaN(scoreVal)) {
          updatedData.score = scoreVal;
        }
      }
      
      // Get yardage/distance value
      if (yardageRef.current) {
        const yardageVal = parseInt(yardageRef.current.value, 10);
        if (!isNaN(yardageVal)) {
          updatedData.distance = yardageVal;
        }
      }
      
      // Get putts value
      if (puttsRef.current) {
        const puttsVal = parseInt(puttsRef.current.value, 10);
        if (!isNaN(puttsVal)) {
          updatedData.putts = puttsVal;
        }
      }
      
      console.log("Collected form data:", updatedData);
      return updatedData;
    });
  }, [data, onDataChange]);

  const handleParChange = (value: string) => {
    const par = parseInt(value, 10);
    if (!isNaN(par)) {
      console.log(`Par changed to ${par}`);
      onDataChange("par", par);
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const score = parseInt(e.target.value, 10);
    if (!isNaN(score)) {
      console.log(`Score changed to ${score}`);
      onDataChange("score", score);
    }
  };
  
  const handlePuttsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const putts = parseInt(e.target.value, 10);
    if (!isNaN(putts)) {
      console.log(`Putts changed to ${putts}`);
      onDataChange("putts", putts);
    }
  };
  
  const handleYardageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const distance = parseInt(e.target.value, 10);
    if (!isNaN(distance)) {
      console.log(`Distance changed to ${distance}`);
      onDataChange("distance", distance);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="par">Par</Label>
        <ToggleGroup type="single" value={data.par?.toString()} onValueChange={handleParChange} className="justify-start">
          <ToggleGroupItem value="3" className="w-12 h-12">3</ToggleGroupItem>
          <ToggleGroupItem value="4" className="w-12 h-12">4</ToggleGroupItem>
          <ToggleGroupItem value="5" className="w-12 h-12">5</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div>
        <Label htmlFor="yards">Yards</Label>
        <Input 
          ref={yardageRef}
          type="number" 
          id="yards" 
          placeholder="Enter yards" 
          value={data.distance || ''} 
          onChange={handleYardageChange}
          className="w-full"
        />
      </div>
      
      <div>
        <Label htmlFor="score">Score</Label>
        <Input 
          ref={scoreRef}
          type="number" 
          id="score" 
          placeholder="Enter score" 
          value={data.score || ''} 
          onChange={handleScoreChange}
          className="w-full"
        />
      </div>
      
      <div>
        <Label htmlFor="putts">Putts</Label>
        <Input 
          ref={puttsRef}
          type="number" 
          id="putts" 
          placeholder="Enter putts" 
          value={data.putts || ''} 
          onChange={handlePuttsChange}
          className="w-full"
        />
      </div>
    </div>
  );
};
