
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Course } from "@/types/round-tracking";
import { useState } from "react";

interface CourseResultProps {
  course: Course;
  onSelect: (course: Course) => void;
  onEdit?: (course: Course) => void;
  showEditButton?: boolean;
}

export const CourseResult = ({
  course,
  onSelect,
  onEdit,
  showEditButton = false,
}: CourseResultProps) => {
  const [isSelected, setIsSelected] = useState(false);
  const [holeCount, setHoleCount] = useState<number>(18);

  const handleSelect = () => {
    setIsSelected(true);
  };

  const handleStartRound = () => {
    onSelect(course);
  };

  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div onClick={handleSelect}>
            <h3 className="font-medium">{course.name}</h3>
            <p className="text-sm text-muted-foreground">
              {course.city}, {course.state}
            </p>
          </div>
          {showEditButton && onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(course);
              }}
            >
              Edit
            </Button>
          )}
        </div>

        {isSelected && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">How many holes?</h4>
              <RadioGroup 
                defaultValue="18" 
                className="grid grid-cols-2 gap-4"
                onValueChange={(value) => setHoleCount(parseInt(value))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="9" id={`nine-${course.id}`} />
                  <Label htmlFor={`nine-${course.id}`}>9 Holes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="18" id={`eighteen-${course.id}`} />
                  <Label htmlFor={`eighteen-${course.id}`}>18 Holes</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleStartRound}
            >
              Start Round
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
