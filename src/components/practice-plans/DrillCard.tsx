
import { useState } from "react";
import { Drill } from "@/types/drill";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DrillDetailsDialog } from "./DrillDetailsDialog";

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

  return (
    <>
      <Card className="border border-border/50 bg-background hover:bg-accent/5 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox 
              checked={isCompleted}
              onCheckedChange={() => onComplete()}
              className="mt-1"
              id={`drill-${drill.id}`}
            />
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <label 
                    htmlFor={`drill-${drill.id}`}
                    className={`font-medium ${isCompleted ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {drill.title}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sets} sets of {reps} reps • {drill.duration}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="ml-auto">
                    {drill.difficulty}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDetails(true)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
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
