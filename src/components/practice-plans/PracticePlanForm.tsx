import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CommonProblemCard } from "./CommonProblemCard";
import { CommonProblem } from "@/types/practice-plan";
import { Separator } from "@/components/ui/separator";
import { Brain } from "@/components/icons/CustomIcons";
import { useState } from "react";
import { PlanDurationDialog } from "./PlanDurationDialog";

interface PracticePlanFormProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onSelectProblem: (problem: string) => void;
  isGenerating: boolean;
  commonProblems: CommonProblem[];
  planDuration: string;
  onPlanDurationChange: (duration: string) => void;
}

export const PracticePlanForm = ({
  inputValue,
  onInputChange,
  onSubmit,
  onSelectProblem,
  isGenerating,
  commonProblems,
  planDuration,
  onPlanDurationChange,
}: PracticePlanFormProps) => {
  const [showDurationDialog, setShowDurationDialog] = useState(false);
  const [isAIGeneration, setIsAIGeneration] = useState(false);

  const handleGenerateClick = (isAI: boolean) => {
    setIsAIGeneration(isAI);
    setShowDurationDialog(true);
  };

  const handleConfirmDuration = () => {
    setShowDurationDialog(false);
    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Practice Plan</CardTitle>
        <CardDescription>
          Get a personalized practice plan based on your specific golf needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Button 
            onClick={() => handleGenerateClick(true)}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Brain className="mr-2 h-4 w-4" />
            {isGenerating ? "Analyzing Your Data..." : "Create Personalized AI Practice Plan"}
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs font-medium text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>
        
        <div className="space-y-4">
          <Textarea 
            placeholder="Describe your golf issue in detail (e.g., 'I'm slicing my driver' or 'I'm struggling with distance control in my putting')"
            className="min-h-32"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
          />
          
          <Button 
            className="w-full" 
            onClick={() => handleGenerateClick(false)}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating Practice Plan..." : "Generate Practice Plan"}
          </Button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-md font-medium">Common Problems</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonProblems.map(item => (
              <CommonProblemCard
                key={item.id}
                item={item}
                onSelect={onSelectProblem}
              />
            ))}
          </div>
        </div>

        <PlanDurationDialog
          isOpen={showDurationDialog}
          onClose={() => setShowDurationDialog(false)}
          planDuration={planDuration}
          onPlanDurationChange={onPlanDurationChange}
          onConfirm={handleConfirmDuration}
        />
      </CardContent>
    </Card>
  );
};
