
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const PracticeRecommendations = () => {
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
          <h3 className="text-lg font-medium">This Week's Focus: Driver Path Correction</h3>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Primary Drill: Alignment Stick Path</h4>
              <p className="text-sm text-muted-foreground">
                Place alignment sticks on the ground to visualize your swing path. This will help correct
                your out-to-in tendency and promote a more neutral or slightly in-to-out path.
              </p>
              <p className="text-sm font-medium mt-2">Recommended frequency: 3x weekly, 15 minutes each</p>
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Secondary Drill: Half-Swing Power</h4>
              <p className="text-sm text-muted-foreground">
                Practice half swings with your driver, focusing on rotating through impact and finishing 
                with the club face pointing at the target.
              </p>
              <p className="text-sm font-medium mt-2">Recommended frequency: 2x weekly, 20 minutes each</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Weekly Assignment</h3>
          <p className="text-sm text-muted-foreground">
            Complete the "100 Putts Challenge" this week to improve your putting stroke consistency.
            Record your results in the Challenge Library.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" className="w-full sm:w-auto">Download PDF Report</Button>
        <Button className="w-full sm:w-auto">Generate Full Practice Plan</Button>
      </CardFooter>
    </Card>
  );
};
