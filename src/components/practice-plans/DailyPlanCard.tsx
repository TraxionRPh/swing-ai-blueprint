
import { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { DayPlan } from "@/types/practice-plan";
import { useToast } from "@/hooks/use-toast";
import { DrillDetailsDialog } from "./DrillDetailsDialog";

interface DailyPlanCardProps {
  dayPlan: DayPlan;
  dayNumber: number;
  completedDrills: Record<string, boolean>;
  onDrillComplete: (drillName: string) => void;
  planId?: string;
}

export const DailyPlanCard = ({ 
  dayPlan, 
  dayNumber,
  completedDrills,
  onDrillComplete,
  planId
}: DailyPlanCardProps) => {
  const [selectedDrill, setSelectedDrill] = useState(null);
  const { toast } = useToast();

  const savedCompletedDrills = useMemo(() => {
    if (!planId) return completedDrills;
    const saved = localStorage.getItem(`completed-drills-${planId}`);
    return saved ? JSON.parse(saved) : completedDrills;
  }, [planId, completedDrills]);

  const handleDrillComplete = (drillName: string) => {
    onDrillComplete(drillName);
    if (planId) {
      const newState = { ...savedCompletedDrills, [drillName]: !savedCompletedDrills[drillName] };
      localStorage.setItem(`completed-drills-${planId}`, JSON.stringify(newState));
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="bg-muted p-3 border-b">
        <h4 className="font-medium">Day {dayNumber}: {dayPlan.focus}</h4>
        <p className="text-xs text-muted-foreground">{dayPlan.duration}</p>
      </div>
      <div className="p-3">
        <ul className="space-y-3">
          {dayPlan.drills.map((drillWithSets, j) => (
            <li key={j} className="border rounded-md overflow-hidden bg-background">
              <div className="flex items-center p-3">
                <Checkbox
                  id={`drill-${dayNumber}-${j}`}
                  checked={savedCompletedDrills[drillWithSets.drill.title]}
                  onCheckedChange={() => handleDrillComplete(drillWithSets.drill.title)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <label 
                        htmlFor={`drill-${dayNumber}-${j}`}
                        className={`text-sm font-medium ${savedCompletedDrills[drillWithSets.drill.title] ? 'text-muted-foreground line-through' : ''}`}
                      >
                        {drillWithSets.drill.title}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {drillWithSets.sets} sets of {drillWithSets.reps} reps
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDrill(drillWithSets.drill)}
                      className="ml-2"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <DrillDetailsDialog
        drill={selectedDrill}
        isOpen={!!selectedDrill}
        onClose={() => setSelectedDrill(null)}
      />
    </div>
  );
};
