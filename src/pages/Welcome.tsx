
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { LucideGolf } from "@/components/icons/CustomIcons";
import { supabase } from "@/integrations/supabase/client";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import SkillLevelStep from "@/components/onboarding/SkillLevelStep";
import GoalsStep from "@/components/onboarding/GoalsStep";
import ProfileSummaryStep from "@/components/onboarding/ProfileSummaryStep";
import { HandicapLevel } from "@/hooks/useProfile";

const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveProfile } = useProfile();
  
  // Form state
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  const [handicap, setHandicap] = useState<HandicapLevel>("intermediate");
  const [goals, setGoals] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [scoreGoal, setScoreGoal] = useState<number | null>(null);
  const [handicapGoal, setHandicapGoal] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await saveProfile({
        handicap,
        goals,
        firstName,
        lastName,
        selected_goals: selectedGoals,
        score_goal: scoreGoal,
        handicap_goal: handicapGoal
      });
      
      toast({
        title: "Profile setup complete!",
        description: "Welcome to ChipAway. Let's start improving your golf game."
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "There was a problem setting up your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <SkillLevelStep 
            handicap={handicap} 
            setHandicap={setHandicap} 
          />
        );
      case 2:
        return (
          <GoalsStep 
            goals={goals}
            setGoals={setGoals}
            selectedGoals={selectedGoals}
            setSelectedGoals={setSelectedGoals}
            scoreGoal={scoreGoal}
            setScoreGoal={setScoreGoal}
            handicapGoal={handicapGoal}
            setHandicapGoal={setHandicapGoal}
          />
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">First Name (optional)</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Last Name (optional)</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
            
            <ProfileSummaryStep
              handicap={handicap}
              goals={goals}
              selectedGoals={selectedGoals}
              scoreGoal={scoreGoal}
              handicapGoal={handicapGoal}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-[600px] max-w-full">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-2">
            <LucideGolf className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to ChipAway</CardTitle>
          <p className="text-muted-foreground">
            Let's set up your profile to personalize your experience
          </p>
          
          <ProgressIndicator currentStep={step} totalSteps={totalSteps} />
        </CardHeader>
        
        <CardContent>
          {renderStep()}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>
          
          {step < totalSteps ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Welcome;
