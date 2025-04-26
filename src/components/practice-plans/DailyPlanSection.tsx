
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DayPlan } from "@/types/practice-plan";
import { DrillCard } from "./DrillCard";

interface DailyPlanSectionProps {
  dayPlan: DayPlan;
  dayNumber: number;
  completedDrills: Record<string, boolean>;
  onDrillComplete: (drillName: string) => void;
}

export const DailyPlanSection = ({ 
  dayPlan, 
  dayNumber, 
  completedDrills, 
  onDrillComplete 
}: DailyPlanSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card>
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-lg flex justify-between">
          <span>Day {dayNumber}: {dayPlan.focus}</span>
          <span className="text-sm font-normal text-muted-foreground">{dayPlan.duration}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {dayPlan.drills.map((drillWithSets, index) => (
            <DrillCard
              key={index}
              drill={drillWithSets.drill}
              sets={drillWithSets.sets}
              reps={drillWithSets.reps}
              isCompleted={!!completedDrills[drillWithSets.drill.title]}
              onComplete={() => onDrillComplete(drillWithSets.drill.title)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
