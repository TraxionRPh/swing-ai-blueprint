
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
}

export const DailyPlanCard = ({ 
  dayPlan, 
  dayNumber,
  completedDrills,
  onDrillComplete
}: DailyPlanCardProps) => {
  const [expandedDrills, setExpandedDrills] = useState<Record<string, boolean>>({});
  const [selectedDrill, setSelectedDrill] = useState(null);
  const { toast } = useToast();

  const toggleDrillExpand = (drillName: string) => {
    setExpandedDrills(prev => ({
      ...prev,
      [drillName]: !prev[drillName]
    }));
  };

  const handleDrillClick = (drill) => {
    setSelectedDrill(drill);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="bg-muted/10 p-3 border-b">
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
                  checked={completedDrills[drillWithSets.drill.title]}
                  onCheckedChange={() => onDrillComplete(drillWithSets.drill.title)}
                  className="mr-3"
                />
                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => toggleDrillExpand(drillWithSets.drill.title)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <label 
                        htmlFor={`drill-${dayNumber}-${j}`}
                        className={`text-sm font-medium ${completedDrills[drillWithSets.drill.title] ? 'text-muted-foreground line-through' : ''}`}
                      >
                        {drillWithSets.drill.title}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {drillWithSets.sets} sets of {drillWithSets.reps} reps
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDrillClick(drillWithSets.drill);
                      }}
                      className="px-2 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                    >
                      View Details
                    </button>
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
