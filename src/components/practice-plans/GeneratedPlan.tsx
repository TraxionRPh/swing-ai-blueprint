
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DiagnosisCard } from "./DiagnosisCard";
import { DailyPlanSection } from "./DailyPlanSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, ArrowLeft } from "lucide-react";
import { useChallenge } from "@/hooks/useChallenge";

interface GeneratedPlanProps {
  plan: GeneratedPracticePlan;
  onClear: () => void;
  planDuration?: string;
  planId?: string;
}

export const GeneratedPlan = ({ plan, onClear, planDuration = "1", planId }: GeneratedPlanProps) => {
  const { toast } = useToast();
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`completed-drills-${planId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [initialScore, setInitialScore] = useState(() => {
    const saved = localStorage.getItem(`challenge-initial-${planId}`);
    return saved || '';
  });
  const [finalScore, setFinalScore] = useState(() => {
    const saved = localStorage.getItem(`challenge-final-${planId}`);
    return saved || '';
  });
  
  // Use first recommended drill for finding a matching challenge
  const focusArea = plan.recommendedDrills && plan.recommendedDrills.length > 0 && plan.recommendedDrills[0]?.focus?.[0] || "driving"; 
  const { data: challengeData, isLoading: challengeLoading } = useChallenge("1"); // We'll use a default challenge ID

  useEffect(() => {
    if (planId) {
      localStorage.setItem(`completed-drills-${planId}`, JSON.stringify(completedDrills));
    }
  }, [completedDrills, planId]);

  const toggleDrillCompletion = (drillName: string) => {
    const newCompletedState = !completedDrills[drillName];
    
    setCompletedDrills(prev => ({
      ...prev,
      [drillName]: newCompletedState
    }));
    
    toast({
      title: newCompletedState ? "Drill Completed" : "Drill Marked Incomplete",
      description: newCompletedState ? 
        `You've completed the ${drillName} drill!` : 
        `You've marked ${drillName} as incomplete.`
    });
  };

  const planData = plan.practicePlan?.plan || [];
  const durationNum = parseInt(planDuration) || 1;
  const filteredDays = planData.slice(0, durationNum);

  const saveScore = (type: 'initial' | 'final', score: string) => {
    if (planId) {
      localStorage.setItem(`challenge-${type}-${planId}`, score);
      if (type === 'initial') {
        setInitialScore(score);
      } else {
        setFinalScore(score);
      }
      
      toast({
        title: "Score Saved",
        description: `Your ${type} score has been saved.`
      });
    }
  };

  const getProgressStatus = () => {
    if (!initialScore || !finalScore) return null;
    
    const initial = parseFloat(initialScore);
    const final = parseFloat(finalScore);
    
    if (isNaN(initial) || isNaN(final)) return null;
    
    if (final > initial) return "improved";
    if (final === initial) return "same";
    return "worse";
  };

  const progressStatus = getProgressStatus();
  const challengeName = challengeData?.title || `${plan.problem} Challenge`;
  const challengeInstructions = challengeData ? 
    [challengeData.instruction1, challengeData.instruction2, challengeData.instruction3].filter(Boolean) : [];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onClear} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Plans
      </Button>
      
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Practice Plan: {plan.problem}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This practice plan is designed to improve your {plan.problem.toLowerCase()} through targeted drills and exercises.
            Complete the recommended drills over {planDuration} {parseInt(planDuration) === 1 ? 'day' : 'days'} to see improvement.
          </p>
        </CardContent>
      </Card>
      
      {/* Initial Challenge */}
      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-xl flex items-center gap-2 text-primary">
            <Info className="h-5 w-5" />
            Before You Start: {challengeName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="mb-4">Complete this challenge to measure your current skill level with {plan.problem}.</p>
          
          <div className="space-y-4">
            {challengeLoading ? (
              <p>Loading challenge details...</p>
            ) : challengeData ? (
              <div className="space-y-2">
                <h3 className="font-medium">Instructions:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {challengeInstructions.map((instruction, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{instruction}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-amber-500">Challenge details not available</p>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Initial Score</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={initialScore}
                  onChange={(e) => setInitialScore(e.target.value)}
                  placeholder="Enter your starting score"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button onClick={() => saveScore('initial', initialScore)}>Save</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Diagnosis */}
      <DiagnosisCard diagnosis={plan.diagnosis} rootCauses={plan.rootCauses} />
      
      {/* Daily Plans */}
      {filteredDays && filteredDays.length > 0 ? (
        filteredDays.map((dayPlan, i) => (
          <DailyPlanSection
            key={i}
            dayPlan={dayPlan}
            dayNumber={i + 1}
            completedDrills={completedDrills}
            onDrillComplete={toggleDrillCompletion}
          />
        ))
      ) : (
        <Card className="border-amber-200">
          <CardContent className="p-6">
            <p className="text-amber-600">No daily practice plans available. Please try regenerating this plan.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Final Challenge */}
      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-xl flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            After Completion: {challengeName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="mb-4">Now that you've completed the practice plan, take the challenge again to measure your improvement.</p>
          
          <div className="space-y-4">
            {challengeLoading ? (
              <p>Loading challenge details...</p>
            ) : challengeData ? (
              <div className="space-y-2">
                <h3 className="font-medium">Instructions:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {challengeInstructions.map((instruction, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{instruction}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-amber-500">Challenge details not available</p>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Final Score</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={finalScore}
                  onChange={(e) => setFinalScore(e.target.value)}
                  placeholder="Enter your final score"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <Button onClick={() => saveScore('final', finalScore)}>Save</Button>
              </div>
            </div>
            
            {progressStatus && (
              <Alert className={
                progressStatus === "improved" ? "bg-green-50 border-green-200 text-green-800" :
                progressStatus === "same" ? "bg-amber-50 border-amber-200 text-amber-800" : 
                "bg-rose-50 border-rose-200 text-rose-800"
              }>
                <AlertTitle>
                  {progressStatus === "improved" ? "You've improved!" : 
                   progressStatus === "same" ? "You maintained your level" : 
                   "Your score decreased"}
                </AlertTitle>
                <AlertDescription>
                  {progressStatus === "improved" ? 
                    `Great job! Your score improved from ${initialScore} to ${finalScore}.` : 
                   progressStatus === "same" ? 
                    `You maintained your score of ${finalScore}.` : 
                    `Your score went from ${initialScore} to ${finalScore}. Keep practicing!`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
