
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const IdentifiedIssues = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Identified Issues</CardTitle>
        <CardDescription>
          Areas where AI has detected opportunities for improvement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <h4 className="font-medium">Driver Path</h4>
            <Badge variant="secondary">High Priority</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Data shows a consistent out-to-in swing path with your driver, 
            leading to slices on 68% of drives.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <h4 className="font-medium">Bunker Play</h4>
            <Badge variant="secondary">Medium Priority</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Sand save percentage is 22%, well below average for your handicap range.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <h4 className="font-medium">Iron Distance Control</h4>
            <Badge variant="secondary">Medium Priority</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Your approach shots show inconsistent distance control, with 65% landing short.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="secondary">
          View Recommended Drills
        </Button>
      </CardFooter>
    </Card>
  );
};
