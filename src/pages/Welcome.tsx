
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LucideGolf } from "@/components/icons/CustomIcons";
import { Separator } from "@/components/ui/separator";

const Welcome = () => {
  const [step, setStep] = useState(1);
  const [handicap, setHandicap] = useState<string>("beginner");
  const [goals, setGoals] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleNext = () => {
    setStep(step + 1);
  };
  
  const handleComplete = () => {
    toast({
      title: "Profile set up successfully!",
      description: "Your personalized golf training experience is ready.",
    });
    navigate("/dashboard");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <LucideGolf className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to SwingAI</CardTitle>
          <CardDescription>Let's set up your profile to personalize your experience</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between mb-6">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className="w-2"></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className="w-2"></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
          </div>
          
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-medium">What's your golf skill level?</h3>
              <RadioGroup value={handicap} onValueChange={setHandicap}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner">Beginner (36+ handicap)</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="novice" id="novice" />
                  <Label htmlFor="novice">Novice (25-36 handicap)</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate (15-24 handicap)</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced">Advanced (5-14 handicap)</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="expert" id="expert" />
                  <Label htmlFor="expert">Expert (0-4 handicap)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pro" id="pro" />
                  <Label htmlFor="pro">Professional (+ handicap)</Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-medium">What are your golf goals?</h3>
              <Textarea 
                placeholder="e.g., Lower my handicap, improve driving distance, better putting, etc."
                className="min-h-32"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-medium">Your SwingAI Profile</h3>
              <div className="space-y-2">
                <p className="font-medium">Skill Level:</p>
                <p className="text-muted-foreground capitalize">{handicap}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="font-medium">Your Goals:</p>
                <p className="text-muted-foreground">{goals || "No specific goals provided"}</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button 
              onClick={handleNext} 
              disabled={step === 2 && !goals.trim()}
              className={step === 1 ? "ml-auto" : ""}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Get Started
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Welcome;
