
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { ProgressIndicator } from "@/components/onboarding/ProgressIndicator";
import { GoalsStep } from "@/components/onboarding/GoalsStep";
import { SkillLevelStep } from "@/components/onboarding/SkillLevelStep";
import { ProfileSummaryStep } from "@/components/onboarding/ProfileSummaryStep";

const Welcome = () => {
  const { 
    isFirstVisit, 
    loading, 
    handicap, 
    goals, 
    setHandicap, 
    setGoals, 
    saveProfile 
  } = useProfile();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await saveProfile({ handicap, goals });
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isFirstVisit) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Your Golf Improvement Journey</CardTitle>
          <ProgressIndicator currentStep={currentStep} totalSteps={3} />
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <SkillLevelStep 
              handicap={handicap} 
              setHandicap={setHandicap} 
            />
          )}
          {currentStep === 2 && (
            <GoalsStep 
              goals={goals} 
              setGoals={setGoals} 
            />
          )}
          {currentStep === 3 && (
            <ProfileSummaryStep 
              handicap={handicap} 
              goals={goals} 
            />
          )}
          
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePreviousStep}>
                Previous
              </Button>
            )}
            {currentStep < 3 && (
              <Button onClick={handleNextStep}>
                Next
              </Button>
            )}
            {currentStep === 3 && (
              <Button onClick={handleCompleteOnboarding}>
                Complete Onboarding
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;
