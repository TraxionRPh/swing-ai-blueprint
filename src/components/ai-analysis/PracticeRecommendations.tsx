
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Drill {
  name: string;
  description: string;
  frequency: string;
}

interface Recommendations {
  weeklyFocus: string;
  primaryDrill: Drill;
  secondaryDrill: Drill;
  weeklyAssignment: string;
}

interface PracticeRecommendationsProps {
  recommendations?: Recommendations;
}

export const PracticeRecommendations = ({ recommendations }: PracticeRecommendationsProps) => {
  const defaultRecommendations = {
    weeklyFocus: "Driving Accuracy Improvement",
    primaryDrill: {
      name: "Alignment Stick Path",
      description: "Place alignment sticks on the ground to visualize and improve your swing path. This drill helps develop a more consistent and effective driving motion.",
      frequency: "3x weekly, 15 minutes each"
    },
    secondaryDrill: {
      name: "Half-Swing Power",
      description: "Practice half swings with your driver, focusing on rotating through impact and maintaining good balance throughout your swing motion.",
      frequency: "2x weekly, 20 minutes each"
    },
    weeklyAssignment: "Complete the \"100 Putts Challenge\" this week to improve your putting stroke consistency. Record your results in the Challenge Library."
  };

  const displayRecommendations = recommendations || defaultRecommendations;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">AI Practice Recommendations</CardTitle>
        <CardDescription>
          Personalized practice plan based on your recent performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">This Week's Focus: {displayRecommendations.weeklyFocus}</h3>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Primary Drill: {displayRecommendations.primaryDrill.name}</h4>
              <p className="text-sm text-muted-foreground">
                {displayRecommendations.primaryDrill.description}
              </p>
              <p className="text-sm font-medium mt-2">
                Recommended frequency: {displayRecommendations.primaryDrill.frequency}
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Secondary Drill: {displayRecommendations.secondaryDrill.name}</h4>
              <p className="text-sm text-muted-foreground">
                {displayRecommendations.secondaryDrill.description}
              </p>
              <p className="text-sm font-medium mt-2">
                Recommended frequency: {displayRecommendations.secondaryDrill.frequency}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Weekly Assignment</h3>
          <p className="text-sm text-muted-foreground">
            {displayRecommendations.weeklyAssignment}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => window.location.href = '/practice-plans'}>
          Generate Full Practice Plan
        </Button>
      </CardFooter>
    </Card>
  );
};
