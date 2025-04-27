
import { useState } from "react";
import { Drill } from "@/types/drill";
import { Card, CardContent } from "@/components/ui/card";
import { DrillDetailsDialog } from "./DrillDetailsDialog";
import { DrillCardTitle } from "./DrillCardTitle";
import { DrillCardDetails } from "./DrillCardDetails";

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
          <DrillCardTitle 
            drill={drill}
            isCompleted={isCompleted}
            onComplete={onComplete}
          />
          
          <DrillCardDetails 
            sets={sets}
            reps={reps}
            duration={drill.duration}
            onViewDetails={() => setShowDetails(true)}
          />
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
