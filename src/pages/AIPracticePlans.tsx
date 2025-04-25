import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain } from "lucide-react";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";

const commonProblems = [
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
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
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
    
    // Simulate AI response generation
    setTimeout(() => {
      // For demo, generate plan based on slicing issue regardless of input
      const mockPlan = {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice Plans</h1>
          <p className="text-muted-foreground">
            Get personalized practice plans based on your performance
          </p>
        </div>
        <Button
          onClick={() => generateAnalysis()}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Brain className="mr-2 h-4 w-4" />
          {isAnalyzing ? "Analyzing Your Data..." : "Generate AI Practice Plan"}
        </Button>
      </div>
      
      {!generatedPlan ? (
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Golf Issue</CardTitle>
            <CardDescription>
              Tell us what specific problem you're having with your golf game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea 
              placeholder="Describe your golf issue in detail (e.g., 'I'm slicing my driver' or 'I'm struggling with distance control in my putting')"
              className="min-h-32"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            
            <div className="space-y-4">
              <h3 className="text-md font-medium">Common Problems</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {commonProblems.map(item => (
                  <button
                    key={item.id}
                    className="text-left p-3 bg-muted/50 hover:bg-muted rounded-lg border border-transparent hover:border-muted-foreground/20 transition-colors"
                    onClick={() => handleSelectProblem(item.problem)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium">{item.problem}</h4>
                      <Badge variant="outline" className="text-xs">{item.popularity}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating Practice Plan..." : "Generate Practice Plan"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Practice Plan: {generatedPlan.problem}</h2>
            <Button variant="outline" onClick={handleClear}>
              New Plan
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{generatedPlan.diagnosis}</p>
              
              <h3 className="font-medium mt-6 mb-2">Root Causes</h3>
              <ul className="list-disc pl-5 space-y-1">
                {generatedPlan.rootCauses.map((cause: string, i: number) => (
                  <li key={i} className="text-muted-foreground">{cause}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recommended Drills</CardTitle>
              <CardDescription>
                Practice these drills to address your specific issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedPlan.recommendedDrills.map((drill: any, i: number) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{drill.name}</h4>
                    <Badge>{drill.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{drill.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      {drill.focus.map((tag: string) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{drill.duration}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Suggested Practice Plan</CardTitle>
              <CardDescription>
                Follow this plan for {generatedPlan.practicePlan.duration} to address your {generatedPlan.problem} issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <span className="font-medium">Recommended practice: </span>
                <span className="text-muted-foreground">{generatedPlan.practicePlan.frequency}, focusing on the drills below.</span>
              </div>
              
              {generatedPlan.practicePlan.sessions.map((session: any, i: number) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="bg-secondary/10 p-3 border-b">
                    <h4 className="font-medium">Session {i+1}: {session.focus}</h4>
                    <p className="text-xs text-muted-foreground">{session.duration}</p>
                  </div>
                  <div className="p-3">
                    <ul className="space-y-2">
                      {session.drills.map((drill: string, j: number) => (
                        <li key={j} className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{drill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h4 className="font-medium mb-2">AI Tip</h4>
                <p className="text-sm text-muted-foreground">
                  Record your practice sessions with your phone from both face-on and down-the-line angles. 
                  This will help you track your progress and make necessary adjustments.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save Plan</Button>
              <Button>Add to Practice Schedule</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIPracticePlans;
