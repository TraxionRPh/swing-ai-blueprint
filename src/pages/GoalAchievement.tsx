
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactConfetti from 'react-confetti';
import { Button } from "@/components/ui/button";
import { PartyPopper, Trophy } from "lucide-react";
import { useProfile } from '@/hooks/useProfile';

const GoalAchievement = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { saveProfile } = useProfile();
  
  // Extract goal information from navigation state
  const goalType = location.state?.goalType;
  const goalValue = location.state?.goalValue;
  const actualValue = location.state?.actualValue;
  
  console.log("GoalAchievement render with state:", location.state);
  
  // Stop confetti after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);
  
  // If there's no goal data, redirect back to rounds
  useEffect(() => {
    if (!goalType || !goalValue) {
      console.log("No goal data found, redirecting to rounds");
      navigate('/rounds', { replace: true });
    }
  }, [goalType, goalValue, navigate]);
  
  const handleSetNewGoal = async () => {
    navigate('/profile');
  };
  
  const handleContinue = () => {
    navigate('/rounds');
  };
  
  if (!goalType || !goalValue) {
    return null; // Will redirect via the useEffect
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={true}
          numberOfPieces={300}
        />
      )}
      
      <div className="bg-background border rounded-lg shadow-lg p-8 max-w-md mx-auto animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 p-6 rounded-full">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-primary mb-2">
          Congratulations!
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-6">
          <PartyPopper className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Goal Achieved!</h2>
          <PartyPopper className="h-5 w-5 text-yellow-500" />
        </div>
        
        <p className="text-lg mb-6">
          You've reached your {goalType} goal of {goalValue}!
          {actualValue && actualValue !== goalValue && <span> Your actual score was {actualValue}.</span>}
        </p>
        
        <p className="text-muted-foreground mb-8">
          This is a great milestone in your golf journey. Would you like to set a new goal to keep improving?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={handleContinue}>
            Continue
          </Button>
          <Button onClick={handleSetNewGoal}>
            Set New Goal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalAchievement;
