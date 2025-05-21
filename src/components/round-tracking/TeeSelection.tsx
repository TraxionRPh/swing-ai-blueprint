
import { Button } from "@/components/ui/button";
import { Course, CourseTee } from "@/types/round-tracking";
import { cn } from "@/lib/utils";
import { Circle, Plus } from "lucide-react";

interface TeeSelectionProps {
  selectedCourse: Course | null;
  selectedTeeId: string | null;
  onTeeSelect: (teeId: string) => void;
  onAddTee?: () => void; // New prop for handling add tee action
}

export const TeeSelection = ({
  selectedCourse,
  selectedTeeId,
  onTeeSelect,
  onAddTee,
}: TeeSelectionProps) => {
  if (!selectedCourse || !selectedCourse.course_tees?.length) return null;
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Select Tee</h3>
        
        {/* Add new tee button */}
        {onAddTee && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTee}
            className="p-1 h-auto"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="text-xs">Add Tee</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedCourse.course_tees.map((tee) => {
          const isLightColor = ['white', 'yellow', 'gold', 'beige'].includes(tee.color?.toLowerCase() || '');
          const isSelected = selectedTeeId === tee.id;
          
          return (
            <Button
              key={tee.id}
              size="sm"
              variant={isSelected ? "secondary" : "outline"}
              onClick={() => onTeeSelect(tee.id)}
              className={cn(
                "flex items-center",
                isSelected ? "ring-2 ring-white/70 ring-offset-1 shadow-md" : ""
              )}
            >
              <Circle 
                fill={tee.color || "#888"} 
                className="h-4 w-4 mr-2"
                strokeWidth={isLightColor ? 1 : 0}
              />
              <span>{tee.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
