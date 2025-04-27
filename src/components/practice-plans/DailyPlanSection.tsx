
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DayPlan } from "@/types/practice-plan";
import { DrillCard } from "./DrillCard";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Calculate completion percentage
  const totalDrills = dayPlan.drills.length;
  const completedCount = dayPlan.drills.filter(d => completedDrills[d.drill.title]).length;
  const completionPercentage = totalDrills > 0 ? Math.round((completedCount / totalDrills) * 100) : 0;

  return (
    <Card>
      <CardHeader className="bg-muted/50 cursor-pointer" onClick={toggleOpen}>
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Day {dayNumber}: {dayPlan.focus}</span>
            <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {completionPercentage}% Complete
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">{dayPlan.duration}</span>
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-6">
          <div className="space-y-4">
            {dayPlan.drills.length > 0 ? (
              dayPlan.drills.map((drillWithSets, index) => (
                <DrillCard
                  key={index}
                  drill={drillWithSets.drill}
                  sets={drillWithSets.sets}
                  reps={drillWithSets.reps}
                  isCompleted={!!completedDrills[drillWithSets.drill.title]}
                  onComplete={() => onDrillComplete(drillWithSets.drill.title)}
                />
              ))
            ) : (
              <p className="text-amber-600">No drills available for this day.</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
