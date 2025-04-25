
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideGolf } from "@/components/icons/CustomIcons";
import HomePage from "./HomePage";
import SkillLevelStep from "@/components/onboarding/SkillLevelStep";
import GoalsStep from "@/components/onboarding/GoalsStep";
import ProfileSummaryStep from "@/components/onboarding/ProfileSummaryStep";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import { useProfile } from "@/hooks/useProfile";

const Welcome = () => {
  const [step, setStep] = useState(1);
  const { 
    isFirstVisit, 
    handicap, 
    goals, 
    setHandicap, 
    setGoals, 
    saveProfile, 
    loading 
  } = useProfile();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <div className="animate-pulse">Loading...</div>
        </Card>
      </div>
    );
  }
  
  if (!isFirstVisit) {
    return <HomePage />;
  }
  
  const handleNext = () => {
    setStep(step + 1);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <LucideGolf className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to ChipAway</CardTitle>
          <CardDescription>Let's set up your profile to personalize your experience</CardDescription>
        </CardHeader>
        
        <CardContent>
          <ProgressIndicator currentStep={step} totalSteps={3} />
          
          {step === 1 && (
            <SkillLevelStep handicap={handicap} setHandicap={setHandicap} />
          )}
          
          {step === 2 && (
            <GoalsStep goals={goals} setGoals={setGoals} />
          )}
          
          {step === 3 && (
            <ProfileSummaryStep handicap={handicap} goals={goals} />
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
            <Button onClick={saveProfile}>
              Get Started
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Welcome;
