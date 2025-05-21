
import { Button } from "@/components/ui/button";
import { Course, CourseTee } from "@/types/round-tracking";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

interface TeeSelectionProps {
  selectedCourse: Course | null;
  selectedTeeId: string | null;
  onTeeSelect: (teeId: string) => void;
}

export const TeeSelection = ({
  selectedCourse,
  selectedTeeId,
  onTeeSelect,
}: TeeSelectionProps) => {
  if (!selectedCourse || !selectedCourse.course_tees?.length) return null;
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Select Tee</h3>
      <div className="flex flex-wrap gap-2">
        {selectedCourse.course_tees.map((tee) => {
          const isLightColor = ['white', 'yellow', 'gold', 'beige'].includes(tee.color?.toLowerCase() || '');
          const isSelected = selectedTeeId === tee.id;
          
          return (
            <Button
              key={tee.id}
              size="sm"
              variant="outline"
              onClick={() => onTeeSelect(tee.id)}
              className={cn(
                "relative flex items-center overflow-hidden transition-all",
                isSelected ? "ring-2 ring-white/70 ring-offset-1 shadow-md" : ""
              )}
            >
              <Circle 
                fill={tee.color || "#888"} 
                className="h-4 w-4 mr-2"
                strokeWidth={isLightColor ? 1 : 0}
              />
              <span>{tee.color || tee.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
