
import { useState } from "react";
import { Drill } from "@/types/drill";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DrillDetailsDialog } from "./DrillDetailsDialog";
import { Info } from "lucide-react";

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

  // Ensure drill exists to prevent errors
  if (!drill) {
    return null;
  }

  return (
    <>
      <Card className={`
        border border-border/50 
        ${isCompleted ? 'bg-green-50 dark:bg-green-900/10' : 'bg-background'} 
        hover:bg-accent/5 
        transition-colors
        relative
      `}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox 
                checked={isCompleted}
                onCheckedChange={() => onComplete()}
                id={`drill-${drill.id}`}
              />
              <label 
                htmlFor={`drill-${drill.id}`}
                className={`
                  font-medium text-base 
                  ${isCompleted ? 'text-muted-foreground line-through' : ''}
                `}
              >
                {drill.title}
              </label>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {drill.difficulty || 'Beginner'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div>
              <span>{sets} sets of {reps} reps</span>
              <span className="mx-2">•</span>
              <span>{drill.duration || '10-15 minutes'}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(true);
              }}
            >
              <Info className="h-4 w-4" />
            </Button>
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
