
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { DayPlan } from "@/types/practice-plan";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const toggleDrillExpand = (drillName: string) => {
    setExpandedDrills(prev => ({
      ...prev,
      [drillName]: !prev[drillName]
    }));
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-secondary/10 p-3 border-b">
        <h4 className="font-medium">Day {dayNumber}: {dayPlan.focus}</h4>
        <p className="text-xs text-muted-foreground">{dayPlan.duration}</p>
      </div>
      <div className="p-3">
        <ul className="space-y-3">
          {dayPlan.drills.map((drillWithSets, j) => (
            <li key={j} className="border rounded-md overflow-hidden">
              <div className="flex items-center p-3 bg-muted/30">
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
                    <label 
                      htmlFor={`drill-${dayNumber}-${j}`}
                      className={`text-sm font-medium ${completedDrills[drillWithSets.drill.title] ? 'text-muted-foreground line-through' : ''}`}
                    >
                      {drillWithSets.drill.title}
                    </label>
                    {expandedDrills[drillWithSets.drill.title] ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              
              <Collapsible open={expandedDrills[drillWithSets.drill.title]} className="w-full">
                <CollapsibleContent className="p-3 bg-background">
                  <div className="space-y-3">
                    <p className="text-sm">{drillWithSets.drill.description}</p>
                    
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Instructions</p>
                      <ul className="space-y-2">
                        {[drillWithSets.drill.instruction1, drillWithSets.drill.instruction2, drillWithSets.drill.instruction3]
                          .filter(Boolean)
                          .map((instruction, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Sets and Reps</p>
                      <p className="text-sm">{drillWithSets.sets} sets of {drillWithSets.reps} reps</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Focus Areas</p>
                      <div className="flex flex-wrap gap-1">
                        {drillWithSets.drill.focus?.map(area => (
                          <Badge key={area} variant="outline" className="text-xs">{area}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
