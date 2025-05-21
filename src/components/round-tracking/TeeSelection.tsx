
import { Button } from "@/components/ui/button";
import { Course, CourseTee } from "@/types/round-tracking";

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
          
          return (
            <Button
              key={tee.id}
              size="sm"
              variant={selectedTeeId === tee.id ? "default" : "outline"}
              onClick={() => onTeeSelect(tee.id)}
              style={{
                backgroundColor: selectedTeeId === tee.id ? undefined : tee.color || undefined,
                color: selectedTeeId === tee.id ? undefined : 
                       (tee.color ? (isLightColor ? 'black' : 'white') : undefined)
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
