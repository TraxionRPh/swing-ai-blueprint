
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

  // Make sure we have valid drills
  const drills = Array.isArray(dayPlan?.drills) ? dayPlan.drills : [];

  // Calculate completion percentage
  const totalDrills = drills.length;
  const completedCount = drills.filter(d => d?.drill?.title && completedDrills[d.drill.title]).length;
  const completionPercentage = totalDrills > 0 ? Math.round((completedCount / totalDrills) * 100) : 0;

  return (
    <Card>
      <CardHeader className="bg-muted/50 cursor-pointer" onClick={toggleOpen}>
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Day {dayNumber}: {dayPlan?.focus || `Practice Day ${dayNumber}`}</span>
            <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {completionPercentage}% Complete
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">{dayPlan?.duration || '30 minutes'}</span>
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-6">
          <div className="space-y-4">
            {drills.length > 0 ? (
              drills.map((drillWithSets, index) => (
                drillWithSets?.drill ? (
                  <DrillCard
                    key={`${dayNumber}-${index}-${drillWithSets.drill.id || index}`}
                    drill={drillWithSets.drill}
                    sets={drillWithSets.sets || 3}
                    reps={drillWithSets.reps || 10}
                    isCompleted={!!completedDrills[drillWithSets.drill.title]}
                    onComplete={() => onDrillComplete(drillWithSets.drill.title)}
                  />
                ) : null
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
