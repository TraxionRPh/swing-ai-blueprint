import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useNavigate } from "react-router-native";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  const { saveProfile, isFirstVisit, loading } = useProfile();

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

  // Check if user is authenticated and if they've already completed onboarding
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      // If profile is loaded and user has already completed onboarding, redirect to dashboard
      if (!loading && !isFirstVisit) {
        navigate("/dashboard");
      }
    };

    checkAuthAndOnboarding();
  }, [navigate, isFirstVisit, loading]);

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
        handicap_goal: handicapGoal,
      });

      toast({
        title: "Profile setup complete!",
        description:
          "Welcome to ChipAway. Let's start improving your golf game.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description:
          "There was a problem setting up your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking profile status
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <View className="text-center">
          <Text className="text-muted-foreground">
            Loading your profile...
          </Text>
        </View>
      </View>
    );
  }

  // Only render the welcome page if it's actually the first visit
  // Otherwise the useEffect will handle redirection

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <SkillLevelStep handicap={handicap} setHandicap={setHandicap} />
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
          <View className="space-y-6">
            <View className="space-y-2">
              <Text className="text-sm text-muted-foreground">
                First Name (optional)
              </Text>
              <Input
                type="text"
                className="bg-[#111827] text-foreground placeholder:text-muted-foreground border-primary/20"
                value={firstName}
                onChangeText={(text) => setFirstName(text)}
                placeholder="Enter your first name"
              />
            </View>

            <View className="space-y-2">
              <Text className="text-sm text-muted-foreground">
                Last Name (optional)
              </Text>
              <Input
                type="text"
                className="bg-[#111827] text-foreground placeholder:text-muted-foreground border-primary/20"
                value={lastName}
                onChangeText={(text) => setLastName(text)}
                placeholder="Enter your last name"
              />
            </View>

            <ProfileSummaryStep
              handicap={handicap}
              goals={goals}
              selectedGoals={selectedGoals}
              scoreGoal={scoreGoal}
              handicapGoal={handicapGoal}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center p-4">
      <Card className="w-[600px] max-w-full">
        <CardHeader className="text-center space-y-1">
          <View className="flex-row justify-center mb-2">
            <LucideGolf className="h-10 w-10 text-primary" />
          </View>
          <CardTitle className="text-2xl">Welcome to ChipAway</CardTitle>
          <Text className="text-muted-foreground">
            Let's set up your profile to personalize your experience
          </Text>

          <ProgressIndicator currentStep={step} totalSteps={totalSteps} />
        </CardHeader>

        <CardContent>{renderStep()}</CardContent>

        <CardFooter className="flex-row justify-between border-t p-6">
          <Button variant="outline" onPress={handleBack} disabled={step === 1}>
            Back
          </Button>

          {step < totalSteps ? (
            <Button onPress={handleNext}>Next</Button>
          ) : (
            <Button onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </View>
  );
};

export default Welcome;
