
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
      description: "Sand save percentage is 22%, well below average for your handicap range.",
      priority: "Medium" as const
    },
    {
      area: "Iron Distance Control",
      description: "Your approach shots show inconsistent distance control, with 65% landing short.",
      priority: "Medium" as const
    }
  ];

  const displayIssues = issues || defaultIssues;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Identified Issues</CardTitle>
        <CardDescription>
          Areas where AI has detected opportunities for improvement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayIssues.map((issue, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between">
              <h4 className="font-medium">{issue.area}</h4>
              <Badge variant="secondary">{issue.priority} Priority</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {issue.description}
            </p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="secondary">
          View Recommended Drills
        </Button>
      </CardFooter>
    </Card>
  );
};
