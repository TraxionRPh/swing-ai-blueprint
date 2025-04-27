
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface DrillCardDetailsProps {
  sets: number;
  reps: number;
  duration: string;
  onViewDetails: () => void;
}

export const DrillCardDetails = ({ sets, reps, duration, onViewDetails }: DrillCardDetailsProps) => {
  return (
    <div className="flex justify-between items-center text-sm text-muted-foreground">
      <div>
        <span>{sets} sets of {reps} reps</span>
        <span className="mx-2">•</span>
        <span>{duration || '10-15 minutes'}</span>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-0 h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails();
        }}
      >
        <Info className="h-4 w-4" />
      </Button>
    </div>
  );
};
