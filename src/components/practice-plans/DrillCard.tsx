
import { useState } from "react";
import { Drill } from "@/types/drill";
import { Card, CardContent } from "@/components/ui/card";
import { DrillDetailsDialog } from "./DrillDetailsDialog";
import { DrillCardTitle } from "./DrillCardTitle";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface DrillCardProps {
  drill: Drill;
  sets: number;
  reps: number;
  isCompleted: boolean;
  onComplete: () => void;
}

export const DrillCard = ({ 
  drill, 
  sets, 
  reps, 
  isCompleted, 
  onComplete 
}: DrillCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!drill) return null;

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open details if we didn't click the checkbox
    if (!(e.target instanceof HTMLElement) || !e.target.closest('[data-checkbox]')) {
      setShowDetails(true);
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "group transition-all duration-200 cursor-pointer",
          "border border-border/50 hover:border-primary/30 hover:shadow-md",
          isCompleted ? "bg-primary/5 dark:bg-primary/10" : "bg-background",
          "relative overflow-hidden"
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-h-[28px]">
              <div data-checkbox className="mt-1">
                <Checkbox 
                  checked={isCompleted}
                  onCheckedChange={() => onComplete()}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
              <div>
                <h3 className={cn(
                  "text-lg font-semibold leading-tight mb-1 transition-colors",
                  isCompleted && "text-muted-foreground line-through"
                )}>
                  {drill.title}
                </h3>
                <Badge 
                  variant="secondary" 
                  className="text-xs font-normal"
                >
                  {drill.difficulty}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {sets} sets of {reps} reps • {drill.duration || '10-15 minutes'}
          </div>
        </CardContent>
      </Card>

      <DrillDetailsDialog
        drill={drill}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};
