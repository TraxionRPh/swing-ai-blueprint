
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoundStatsProps {
  totalScore: number;
  totalPutts: number;
  fairwaysHit: number;
  greensInRegulation: number;
  totalHoles: number;
  parTotal: number;
  fairwayEligibleHoles: number;
  courseName: string;
  date: string;
}

export const RoundSummaryCard = ({
  totalScore,
  totalPutts,
  fairwaysHit,
  greensInRegulation,
  totalHoles,
  parTotal,
  fairwayEligibleHoles,
  courseName,
  date
}: RoundStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Round Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-md">
            <p className="text-muted-foreground text-sm">Total Score</p>
            <p className="text-3xl font-bold">{totalScore}</p>
            <p className="text-sm">{totalScore - parTotal >= 0 ? "+" : ""}{totalScore - parTotal} to Par</p>
          </div>
          <div className="text-center p-4 border rounded-md">
            <p className="text-muted-foreground text-sm">Total Putts</p>
            <p className="text-3xl font-bold">{totalPutts}</p>
            <p className="text-sm">{(totalPutts / totalHoles).toFixed(1)} per hole</p>
          </div>
          <div className="text-center p-4 border rounded-md">
            <p className="text-muted-foreground text-sm">Fairways Hit</p>
            <p className="text-3xl font-bold">{fairwaysHit}</p>
            <p className="text-sm">{fairwayEligibleHoles > 0 ? 
              Math.round((fairwaysHit / fairwayEligibleHoles) * 100) : 0}%</p>
          </div>
          <div className="text-center p-4 border rounded-md">
            <p className="text-muted-foreground text-sm">Greens in Reg.</p>
            <p className="text-3xl font-bold">{greensInRegulation}</p>
            <p className="text-sm">{Math.round((greensInRegulation / totalHoles) * 100)}%</p>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <h3 className="text-lg font-medium">{courseName}</h3>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </CardContent>
    </Card>
  );
};
