
import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Party } from "lucide-react";

interface GoalAchievementModalProps {
  achievedGoal: {
    type: 'score' | 'handicap';
    value: number;
  } | null;
  onClose: () => void;
  onSetNewGoal: () => void;
}

const GoalAchievementModal = ({ 
  achievedGoal, 
  onClose,
  onSetNewGoal 
}: GoalAchievementModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (achievedGoal) {
      setShowConfetti(true);
      toast({
        title: "Congratulations! 🎉",
        description: `You've reached your ${achievedGoal.type} goal of ${achievedGoal.value}!`,
        duration: 5000,
      });

      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievedGoal, toast]);

  if (!achievedGoal) return null;

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      <Dialog open={Boolean(achievedGoal)} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Party className="h-5 w-5 text-yellow-500" />
              Congratulations!
            </DialogTitle>
            <DialogDescription>
              You've achieved your {achievedGoal.type} goal of {achievedGoal.value}!
              This is a great milestone in your golf journey.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <p className="text-center text-muted-foreground">
              Would you like to set a new goal to keep improving?
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
            <Button onClick={onSetNewGoal}>
              Set New Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoalAchievementModal;
