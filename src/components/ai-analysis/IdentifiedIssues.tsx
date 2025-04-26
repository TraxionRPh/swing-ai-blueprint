
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Issue {
  area: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface IdentifiedIssuesProps {
  issues?: Issue[];
}

export const IdentifiedIssues = ({ issues }: IdentifiedIssuesProps) => {
  const defaultIssues = [
    {
      area: "Driver Path",
      description: "Data shows a consistent out-to-in swing path with your driver, leading to slices on 68% of drives.",
      priority: "High" as const
    },
    {
      area: "Bunker Play",
      description: "Your sand save percentage is currently 22%, which is below average for your handicap range.",
      priority: "Medium" as const
    },
    {
      area: "Iron Distance Control",
      description: "Your approach shots from 150-175 yards show inconsistent distance control, with 65% landing short.",
      priority: "Medium" as const
    }
  ];

  const displayIssues = issues || defaultIssues;

  return (
    <Card className="bg-card border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-primary">Identified Issues</CardTitle>
        <CardDescription className="text-muted-foreground">
          Areas where AI has detected opportunities for improvement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayIssues.map((issue, index) => (
          <div 
            key={index} 
            className="bg-secondary/5 p-4 rounded-lg border border-primary/10 space-y-2"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-primary">{issue.area}</h4>
              <Badge 
                variant={issue.priority === 'High' ? "destructive" : "secondary"}
                className="ml-2"
              >
                {issue.priority} Priority
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {issue.description}
            </p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          onClick={() => window.location.href = '/practice-plans'}
        >
          Generate Practice Plan
        </Button>
      </CardFooter>
    </Card>
  );
};
