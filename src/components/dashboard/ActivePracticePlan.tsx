
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ListTodo } from "lucide-react";

export const ActivePracticePlan = () => {
  return (
    <Card className="mb-4 border-2 border-primary/20">
      <CardHeader>
        <CardTitle>Active Practice Plan</CardTitle>
        <CardDescription>Continue with your personalized practice plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Improving Your Golf Game</h3>
            <p className="text-sm text-muted-foreground">Follow your custom practice plan to enhance your skills</p>
          </div>
          <Button asChild>
            <Link to="/my-practice-plans">
              <ListTodo className="mr-2 h-4 w-4" />
              View Plan
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
