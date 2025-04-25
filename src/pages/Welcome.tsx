
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LucideGolf } from "@/components/icons/CustomIcons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import HomePage from "./HomePage";
import SkillLevelStep from "@/components/onboarding/SkillLevelStep";
import GoalsStep from "@/components/onboarding/GoalsStep";
import ProfileSummaryStep from "@/components/onboarding/ProfileSummaryStep";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";

const Welcome = () => {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const [step, setStep] = useState(1);
  const [handicap, setHandicap] = useState<string>("beginner");
  const [goals, setGoals] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.id) return;
    
    const checkUserProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_onboarded')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking user profile:', error);
        setIsFirstVisit(false);
        return;
      }
      
      setIsFirstVisit(!data?.has_onboarded);
    };
    
    checkUserProfile();
  }, [user?.id]);
  
  const handleNext = () => {
    setStep(step + 1);
  };
  
  const handleComplete = async () => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          handicap_level: handicap,
          goals: goals,
          has_onboarded: true
        });
        
      if (error) throw error;
      
      toast({
        title: "Profile set up successfully!",
        description: "Your personalized golf training experience is ready.",
      });
      
      setIsFirstVisit(false);
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isFirstVisit === null) {
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
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-[url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40" />
      
      <Card className="w-full max-w-md z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <LucideGolf className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to SwingAI</CardTitle>
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
