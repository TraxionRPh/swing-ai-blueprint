
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return "bg-emerald-500 hover:bg-emerald-600 text-white border-0";
      case 'intermediate':
        return "bg-amber-500 hover:bg-amber-600 text-white border-0";
      case 'advanced':
        return "bg-rose-500 hover:bg-rose-600 text-white border-0";
      default:
        return "bg-slate-500 hover:bg-slate-600 text-white border-0";
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
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
                  className={cn("text-xs font-normal", getDifficultyColor(drill.difficulty || 'beginner'))}
                >
                  {drill.difficulty || 'Beginner'}
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
