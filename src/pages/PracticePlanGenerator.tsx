
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlanTypeSelector } from "@/components/practice-plans/PlanTypeSelector";
import { PlanDurationSelector } from "@/components/practice-plans/PlanDurationSelector";
import { FocusAreaSelector } from "@/components/practice-plans/FocusAreaSelector";
import { LucideGolf } from "@/components/icons/CustomIcons";

const PracticePlanGenerator = () => {
  const [planType, setPlanType] = useState<string>("ai");
  const [duration, setDuration] = useState<string>("1");
  const [focus, setFocus] = useState<string>("balanced");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const { toast } = useToast();
  
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    
    // Simulating API call to generate plan
    setTimeout(() => {
      const mockPlan = {
        days: parseInt(duration),
        focus: focus,
        sessionsPerDay: 1,
        totalTime: parseInt(duration) * 60,
        sessions: [
          {
            day: 1,
            title: "Building Fundamentals",
            drills: [
              { name: "Alignment Stick Path", duration: 15, type: "driving" },
              { name: "Gate Drill", duration: 10, type: "putting" },
              { name: "Chip-It Circle", duration: 15, type: "chipping" },
              { name: "Distance Control", duration: 20, type: "irons" }
            ]
          }
        ]
      };
      
      // Add more sessions for multi-day plans
      if (parseInt(duration) >= 3) {
        mockPlan.sessions.push({
          day: 2,
          title: "Focus on Weaknesses",
          drills: [
            { name: "Tempo Training", duration: 15, type: "driving" },
            { name: "Clock Drill", duration: 20, type: "putting" },
            { name: "Ball Position Ladder", duration: 15, type: "irons" }
          ]
        });
        mockPlan.sessions.push({
          day: 3,
          title: "Challenge Day",
          drills: [
            { name: "Up-and-Down Challenge", duration: 25, type: "chipping" },
            { name: "100 Putts Challenge", duration: 30, type: "putting" }
          ]
        });
      }
      
      if (parseInt(duration) === 5) {
        mockPlan.sessions.push({
          day: 4,
          title: "Precision Work",
          drills: [
            { name: "Half-Swing Power", duration: 20, type: "driving" },
            { name: "Distance Control", duration: 20, type: "irons" },
            { name: "Gate Drill", duration: 10, type: "putting" }
          ]
        });
        mockPlan.sessions.push({
          day: 5,
          title: "Integration Day",
          drills: [
            { name: "9-Shot Challenge", duration: 30, type: "full swing" },
            { name: "Clock Drill", duration: 20, type: "putting" }
          ]
        });
      }
      
      setGeneratedPlan(mockPlan);
      setIsGenerating(false);
      
      toast({
        title: "Practice Plan Generated",
        description: `Your ${duration}-day practice plan is ready!`,
      });
    }, 2000);
  };
  
  const handleSavePlan = () => {
    toast({
      title: "Practice Plan Saved",
      description: "Your practice plan has been saved to your profile.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice Plan Generator</h1>
        <p className="text-muted-foreground">
          Create personalized practice plans to improve your golf game
        </p>
      </div>
      
      {!generatedPlan ? (
        <Card>
          <CardHeader>
            <CardTitle>Generate a New Practice Plan</CardTitle>
            <CardDescription>
              Choose your preferences to create a tailored practice routine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PlanTypeSelector planType={planType} onChange={setPlanType} />
            <PlanDurationSelector duration={duration} onChange={setDuration} />
            <FocusAreaSelector focus={focus} onChange={setFocus} />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGeneratePlan} 
              disabled={isGenerating} 
              className="w-full"
            >
              {isGenerating ? "Generating Plan..." : "Generate Practice Plan"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {generatedPlan.days}-Day {generatedPlan.focus.charAt(0).toUpperCase() + generatedPlan.focus.slice(1)} Practice Plan
              </h2>
              <p className="text-muted-foreground">
                Total practice time: {generatedPlan.totalTime} minutes
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setGeneratedPlan(null)}>
                Create New Plan
              </Button>
              <Button onClick={handleSavePlan}>
                Save Plan
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            {generatedPlan.sessions.map((session: any) => (
              <Card key={session.day}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Day {session.day}: {session.title}</CardTitle>
                      <CardDescription>
                        {session.drills.reduce((total: number, drill: any) => total + drill.duration, 0)} minutes total
                      </CardDescription>
                    </div>
                    <Badge>Day {session.day}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.drills.map((drill: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <LucideGolf className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{drill.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{drill.type}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{drill.duration} mins</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticePlanGenerator;
