
import { Button } from "@/components/ui/button";
import { Course, CourseTee } from "@/types/round-tracking";
import { cn } from "@/lib/utils";

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
                "border-2",
                isSelected ? "border-white ring-2 ring-white/30" : "border-transparent"
              )}
              style={{
                backgroundColor: tee.color || undefined,
                color: tee.color ? (isLightColor ? 'black' : 'white') : undefined
              }}
            >
              {tee.color || tee.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
