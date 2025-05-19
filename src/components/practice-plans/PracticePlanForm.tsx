
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CommonProblemCard } from "./CommonProblemCard";
import { CommonProblem } from "@/types/practice-plan";
import { Separator } from "@/components/ui/separator";
import { Brain } from "@/components/icons/CustomIcons";
import { useState, useEffect } from "react";
import { PlanDurationDialog } from "./PlanDurationDialog";

interface PracticePlanFormProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (isAI: boolean) => void;
  onSelectProblem: (problem: string) => void;
  isAiGenerating: boolean;
  isManualGenerating: boolean;
  commonProblems: CommonProblem[];
  planDuration: string;
  onPlanDurationChange: (duration: string) => void;
}

export const PracticePlanForm = ({
  inputValue,
  onInputChange,
  onSubmit,
  onSelectProblem,
  isAiGenerating,
  isManualGenerating,
  commonProblems,
  planDuration,
  onPlanDurationChange,
}: PracticePlanFormProps) => {
  const [showDurationDialog, setShowDurationDialog] = useState(false);
  const [isAIGeneration, setIsAIGeneration] = useState(false);
  const [enhancedInput, setEnhancedInput] = useState('');

  // Effect to explicitly tag skill-specific queries
  useEffect(() => {
    let processedInput = inputValue;
    
    // PUTTING: Strict enforcement for putting-related queries
    const isPuttingQuery = inputValue.toLowerCase().includes('putt') || 
                         inputValue.toLowerCase().includes('green') ||
                         inputValue.toLowerCase().includes('read') || 
                         inputValue.toLowerCase().includes('lag');
                         
    // DRIVING: Strict enforcement for driver/tee shot problems
    const isDrivingQuery = inputValue.toLowerCase().includes('driver') ||
                         inputValue.toLowerCase().includes('tee shot') ||
                         inputValue.toLowerCase().includes('off the tee') ||
                         inputValue.toLowerCase().includes('slice') ||
                         inputValue.toLowerCase().includes('hook');
                        
    // IRON PLAY: Strict enforcement for iron play problems
    const isIronQuery = inputValue.toLowerCase().includes('iron') ||
                      inputValue.toLowerCase().includes('approach') ||
                      inputValue.toLowerCase().includes('ball striking') ||
                      inputValue.toLowerCase().includes(' mid game') ||
                      inputValue.toLowerCase().includes('contact');
                        
    // SHORT GAME: Strict enforcement for chipping/pitching problems
    const isChippingQuery = inputValue.toLowerCase().includes('chip') ||
                          inputValue.toLowerCase().includes('pitch') ||
                          inputValue.toLowerCase().includes('short game') ||
                          inputValue.toLowerCase().includes('around the green');
                          
    // BUNKER: Strict enforcement for bunker/sand problems
    const isBunkerQuery = inputValue.toLowerCase().includes('bunker') || 
                        inputValue.toLowerCase().includes('sand');
    
    // Add explicit category requirements based on the problem type
    if (isPuttingQuery) {
      processedInput = `STRICTLY PUTTING ONLY: ${inputValue} - THIS IS A PUTTING-ONLY PLAN: ONLY use drills with category="putting". NO other drill types allowed.`;
    }
    else if (isDrivingQuery) {
      processedInput = `STRICTLY DRIVING ONLY: ${inputValue} - THIS IS A DRIVING-ONLY PLAN: ONLY use drills with categories related to driving, tee shots, or long game. NO other drill types allowed.`;
    }
    else if (isIronQuery) {
      processedInput = `STRICTLY IRON PLAY ONLY: ${inputValue} - THIS IS AN IRON PLAY PLAN: ONLY use drills with categories related to irons, approach shots, or ball striking. NO other drill types allowed.`;
    }
    else if (isChippingQuery) {
      processedInput = `STRICTLY SHORT GAME ONLY: ${inputValue} - THIS IS A SHORT GAME PLAN: ONLY use drills with categories related to chipping, pitching, or short game. NO other drill types allowed.`;
    }
    else if (isBunkerQuery) {
      processedInput = `STRICTLY BUNKER PLAY ONLY: ${inputValue} - THIS IS A BUNKER/SAND PLAN: ONLY use drills with categories related to bunkers or sand shots. NO other drill types allowed.`;
    }
    
    setEnhancedInput(processedInput);
  }, [inputValue]);

  const handleGenerateClick = (isAI: boolean) => {
    setIsAIGeneration(isAI);
    setShowDurationDialog(true);
  };

  const handleConfirmDuration = () => {
    setShowDurationDialog(false);
    
    // Replace input with enhanced version (category-tagged) before submitting
    if (needsCategoryEnhancement(inputValue) && inputValue !== enhancedInput) {
      onInputChange(enhancedInput);
      setTimeout(() => {
        onSubmit(isAIGeneration);
      }, 100);
    } else {
      onSubmit(isAIGeneration);
    }
  };
  
  // Helper function to check if input needs category enhancement
  const needsCategoryEnhancement = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return lowerText.includes('putt') || 
           lowerText.includes('green') ||
           lowerText.includes('driver') ||
           lowerText.includes('slice') ||
           lowerText.includes('hook') ||
           lowerText.includes('iron') ||
           lowerText.includes('approach') ||
           lowerText.includes('chip') || 
           lowerText.includes('pitch') ||
           lowerText.includes('bunker') ||
           lowerText.includes('sand');
  };

  return (
    <Card className="max-w-none">
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
            disabled={isAiGenerating || isManualGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs md:text-sm"
          >
            <Brain className="mr-2 h-4 w-4" />
            {isAiGenerating ? "Analyzing Your Data..." : "Create Personalized AI Practice Plan"}
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
            disabled={isAiGenerating || isManualGenerating}
          >
            {isManualGenerating ? "Generating Practice Plan..." : "Generate Practice Plan"}
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
