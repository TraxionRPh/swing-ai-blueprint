
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Course } from "@/types/round-tracking";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CourseResultProps {
  course: Course;
  onSelect: (course: Course, holeCount?: number) => void;
  onEdit?: (course: Course) => void;
  onDelete?: (roundId: string) => void;
  showEditButton?: boolean;
  isInProgress?: boolean;
  roundId?: string;
}

export const CourseResult = ({
  course,
  onSelect,
  onEdit,
  onDelete,
  showEditButton = false,
  isInProgress = false,
  roundId,
}: CourseResultProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [holeCount, setHoleCount] = useState<number>(18);
  const navigate = useNavigate();

  const handleSelect = () => {
    if (isInProgress && roundId) {
      navigate(`/rounds/${roundId}`);
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleStartRound = (e: React.MouseEvent) => {
    // Prevent the event from bubbling up to the card's click handler
    e.stopPropagation();
    
    // Call onSelect with the course and hole count
    onSelect(course, holeCount);
    setIsExpanded(false);
    
    // Navigate to the new round page
    navigate('/rounds/new');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && roundId) {
      onDelete(roundId);
    }
  };

  return (
    <Card 
      className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleSelect}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{course.name}</h3>
            <p className="text-sm text-muted-foreground">
              {course.city}, {course.state}
            </p>
          </div>
          <div className="flex gap-2">
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
            {isInProgress && onDelete && roundId && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {isExpanded && !isInProgress && (
          <div className="mt-4 border-t pt-4">
            <div className="space-y-4">
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
          </div>
        )}
      </div>
    </Card>
  );
};
