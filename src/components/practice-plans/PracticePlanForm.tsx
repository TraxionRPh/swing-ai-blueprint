
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CommonProblemCard } from "./CommonProblemCard";
import { CommonProblem } from "@/types/practice-plan";

interface PracticePlanFormProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onSelectProblem: (problem: string) => void;
  isGenerating: boolean;
  commonProblems: CommonProblem[];
}

export const PracticePlanForm = ({
  inputValue,
  onInputChange,
  onSubmit,
  onSelectProblem,
  isGenerating,
  commonProblems,
}: PracticePlanFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Describe Your Golf Issue</CardTitle>
        <CardDescription>
          Tell us what specific problem you're having with your golf game
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Textarea 
            placeholder="Describe your golf issue in detail (e.g., 'I'm slicing my driver' or 'I'm struggling with distance control in my putting')"
            className="min-h-32"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
          />
          
          <Button 
            className="w-full" 
            onClick={onSubmit}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating Practice Plan..." : "Generate Practice Plan"}
          </Button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-md font-medium">Common Problems</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {commonProblems.map(item => (
              <CommonProblemCard
                key={item.id}
                item={item}
                onSelect={onSelectProblem}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
