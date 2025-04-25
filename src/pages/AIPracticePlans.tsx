import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain } from "lucide-react";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { PracticePlanForm } from "@/components/practice-plans/PracticePlanForm";
import { GeneratedPlan } from "@/components/practice-plans/GeneratedPlan";
import { CommonProblem, GeneratedPracticePlan } from "@/types/practice-plan";

const commonProblems: CommonProblem[] = [
  {
    id: 1,
    problem: "Slicing my driver",
    description: "Ball starts straight but curves severely right (for right-handed golfers)",
    popularity: "Very Common"
  },
  {
    id: 2,
    problem: "Chunking iron shots",
    description: "Hitting the ground before the ball, resulting in fat shots",
    popularity: "Common"
  },
  {
    id: 3,
    problem: "Three-putting",
    description: "Taking three or more putts to complete a hole",
    popularity: "Very Common"
  },
  {
    id: 4,
    problem: "Topped shots",
    description: "Hitting the top half of the ball, causing low-flying shots",
    popularity: "Common"
  },
  {
    id: 5,
    problem: "Shanking",
    description: "Ball striking the hosel, causing it to shoot right at a sharp angle",
    popularity: "Less Common"
  },
  {
    id: 6,
    problem: "Inconsistent ball striking",
    description: "Variable contact quality leading to unpredictable distances",
    popularity: "Very Common"
  }
];

const AIPracticePlans = () => {
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPracticePlan | null>(null);
  const { toast } = useToast();
  const { generateAnalysis, isGenerating: isAnalyzing } = useAIAnalysis();
  
  const handleSubmit = () => {
    if (!inputValue.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your golf issue or select from common problems.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const mockPlan: GeneratedPracticePlan = {
        problem: inputValue,
        diagnosis: "Based on your description, you're experiencing an out-to-in swing path combined with an open clubface at impact. This is a common issue that causes the ball to start left and curve significantly to the right (for right-handed golfers).",
        rootCauses: [
          "Out-to-in swing path (coming over the top)",
          "Open clubface at impact",
          "Potential grip issues (too weak)",
          "Poor setup alignment"
        ],
        recommendedDrills: [
          {
            name: "Alignment Stick Path Drill",
            description: "Place two alignment sticks on the ground - one pointing at the target and another parallel to it, creating a channel. Practice swinging along this channel to groove an in-to-out path.",
            difficulty: "Beginner",
            duration: "15 minutes",
            focus: ["Swing Path", "Alignment"]
          },
          {
            name: "Half-Swing Control Drill",
            description: "Make half swings focusing on the feeling of the clubface rotating through impact. This helps develop awareness of face control.",
            difficulty: "Beginner",
            duration: "10 minutes",
            focus: ["Face Control", "Impact"]
          },
          {
            name: "Headcover Drill",
            description: "Place a headcover under your trailing armpit and make swings without dropping it. This prevents the over-the-top move that causes slices.",
            difficulty: "Intermediate",
            duration: "15 minutes",
            focus: ["Swing Path", "Connection"]
          }
        ],
        practicePlan: {
          duration: "2 weeks",
          frequency: "3-4 sessions per week",
          sessions: [
            {
              focus: "Path Correction",
              drills: ["Alignment Stick Path Drill", "Headcover Drill"],
              duration: "30 minutes"
            },
            {
              focus: "Face Control",
              drills: ["Half-Swing Control Drill", "Mirror Work"],
              duration: "25 minutes"
            }
          ]
        }
      };
      
      setGeneratedPlan(mockPlan);
      setIsGenerating(false);
      
      toast({
        title: "Practice plan generated",
        description: "Your personalized practice plan is ready!",
      });
    }, 3000);
  };
  
  const handleSelectProblem = (problem: string) => {
    setInputValue(problem);
  };
  
  const handleClear = () => {
    setGeneratedPlan(null);
    setInputValue("");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice Plans</h1>
        <p className="text-muted-foreground mb-4">
          Get personalized practice plans based on your performance
        </p>
        <Button
          onClick={() => generateAnalysis()}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Brain className="mr-2 h-4 w-4" />
          {isAnalyzing ? "Analyzing Your Data..." : "Generate AI Practice Plan"}
        </Button>
      </div>
      
      {!generatedPlan ? (
        <PracticePlanForm
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={handleSubmit}
          onSelectProblem={handleSelectProblem}
          isGenerating={isGenerating}
          commonProblems={commonProblems}
        />
      ) : (
        <GeneratedPlan
          plan={generatedPlan}
          onClear={handleClear}
        />
      )}
    </div>
  );
};

export default AIPracticePlans;
