import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDifficultyBadgeClass } from "@/utils/challengeUtils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
export interface Issue {
  area: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}
interface IdentifiedIssuesProps {
  issues?: Issue[];
}
export const IdentifiedIssues = ({
  issues
}: IdentifiedIssuesProps) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const defaultIssues = [{
    area: "Driving Accuracy",
    description: "Improving your accuracy off the tee will set you up for more successful approach shots and lower scores overall.",
    priority: "High" as const
  }, {
    area: "Short Game",
    description: "Focus on your short game around the greens, especially bunker play. Consistent up-and-downs can significantly lower your scores.",
    priority: "Medium" as const
  }, {
    area: "Iron Play",
    description: "Work on consistent distance control with your irons to improve your approach shots and increase greens in regulation.",
    priority: "Low" as const
  }];
  const displayIssues = issues || defaultIssues;

  // Find the highest priority issue 
  const highestPriorityIssue = [...displayIssues].sort((a, b) => {
    const priorityRank = {
      'High': 0,
      'Medium': 1,
      'Low': 2
    };
    return priorityRank[a.priority] - priorityRank[b.priority];
  })[0];
  const getPriorityBadgeClass = (priority: Issue['priority']) => {
    switch (priority) {
      case 'High':
        return "bg-rose-500 hover:bg-rose-600 text-white border-0";
      case 'Medium':
        return getDifficultyBadgeClass("Intermediate");
      case 'Low':
        return getDifficultyBadgeClass("Beginner");
      default:
        return "bg-slate-500 hover:bg-slate-600 text-white border-0";
    }
  };
  const handleGeneratePlan = () => {
    if (highestPriorityIssue) {
      // Extract the issue description
      const issue = highestPriorityIssue.description;

      // Navigate to the practice plan generator with the issue in the URL state
      navigate('/practice-plans/new', {
        state: {
          focusArea: highestPriorityIssue.area,
          problem: issue
        }
      });
      toast({
        title: `Creating plan for ${highestPriorityIssue.area}`,
        description: "Generating a practice plan to address your highest priority issue."
      });
    } else {
      toast({
        title: "No issues found",
        description: "Could not find any issues to generate a practice plan for.",
        variant: "destructive"
      });
    }
  };
  return <Card className="bg-card border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-primary">Identified Issues</CardTitle>
        <CardDescription className="text-muted-foreground">
          Areas where AI has detected opportunities for improvement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayIssues.map((issue, index) => <div key={index} className="bg-secondary/5 p-4 rounded-lg border border-primary/10 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-primary">{issue.area}</h4>
              <Badge variant="secondary" className={`ml-2 ${getPriorityBadgeClass(issue.priority)}`}>
                {issue.priority} Priority
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {issue.description}
            </p>
          </div>)}
      </CardContent>
      <CardFooter>
        
      </CardFooter>
    </Card>;
};