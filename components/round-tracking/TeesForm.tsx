
import { useState } from "react";
import { useToast } from "../../hooks/use-toast";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface TeeData {
  name: string;
  color: string;
  courseRating: string;
  slopeRating: string;
  totalYards: string;
}

interface TeesFormProps {
  onTeesSubmit: (tees: TeeData[]) => Promise<boolean | void> | void;
  courseId?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const TeesForm = ({ onTeesSubmit, isSubmitting = false, onCancel }: TeesFormProps) => {
  const { toast } = useToast();
  const [tees, setTees] = useState<TeeData[]>([
    { name: "", color: "", courseRating: "", slopeRating: "", totalYards: "" }
  ]);

  const addTee = () => {
    setTees([...tees, { name: "", color: "", courseRating: "", slopeRating: "", totalYards: "" }]);
  };

  const removeTee = (index: number) => {
    setTees(tees.filter((_, i) => i !== index));
  };

  const updateTee = (index: number, field: keyof TeeData, value: string) => {
    const newTees = [...tees];
    newTees[index] = { ...newTees[index], [field]: value };
    setTees(newTees);
  };

  const validateTees = (): boolean => {
    // Check if all required fields are filled
    const hasEmptyRequiredFields = tees.some(tee => 
      !tee.name || !tee.color || !tee.courseRating || !tee.slopeRating || !tee.totalYards
    );
    
    if (hasEmptyRequiredFields) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields for each tee set",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if numeric fields contain valid numbers
    const hasInvalidNumbers = tees.some(tee => {
      const courseRating = parseFloat(tee.courseRating);
      const slopeRating = parseInt(tee.slopeRating);
      const totalYards = parseInt(tee.totalYards);
      
      return (
        isNaN(courseRating) || 
        isNaN(slopeRating) || 
        isNaN(totalYards) ||
        slopeRating < 55 || slopeRating > 155 // Standard range for slope ratings
      );
    });
    
    if (hasInvalidNumbers) {
      toast({
        title: "Invalid ratings",
        description: "Please enter valid course rating, slope rating, and yardage values",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (validateTees()) {
      onTeesSubmit(tees);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {tees.map((tee, index) => (
          <div key={index} className={cn(
            "p-4 border rounded-lg space-y-4",
            index % 2 === 0 ? "bg-background" : "bg-muted"
          )}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tee Set {index + 1}</h3>
              {tees.length > 1 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeTee(index)}
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`tee-name-${index}`}>Tee Name</Label>
                <Input
                  id={`tee-name-${index}`}
                  value={tee.name}
                  onChange={(e) => updateTee(index, "name", e.target.value)}
                  placeholder="e.g., Championship"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`tee-color-${index}`}>Color</Label>
                <Input
                  id={`tee-color-${index}`}
                  value={tee.color}
                  onChange={(e) => updateTee(index, "color", e.target.value)}
                  placeholder="e.g., Blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`course-rating-${index}`}>Course Rating</Label>
                <Input
                  id={`course-rating-${index}`}
                  type="number"
                  step="0.1"
                  value={tee.courseRating}
                  onChange={(e) => updateTee(index, "courseRating", e.target.value)}
                  placeholder="72.4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`slope-rating-${index}`}>Slope Rating</Label>
                <Input
                  id={`slope-rating-${index}`}
                  type="number"
                  value={tee.slopeRating}
                  onChange={(e) => updateTee(index, "slopeRating", e.target.value)}
                  placeholder="133"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`total-yards-${index}`}>Total Yards</Label>
                <Input
                  id={`total-yards-${index}`}
                  type="number"
                  value={tee.totalYards}
                  onChange={(e) => updateTee(index, "totalYards", e.target.value)}
                  placeholder="7200"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={addTee}
        >
          Add Another Tee
        </Button>

        <div className="space-x-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Tees"}
          </Button>
        </div>
      </div>
    </div>
  );
};
