
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ListTodo } from "lucide-react";

export const ActivePracticePlan = () => {
  return (
    <Card className="mb-4 bg-[#1A1F2C] text-white border border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">Active Practice Plan</CardTitle>
        <CardDescription className="text-gray-400">
          Continue with your personalized practice plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Improving Your Golf Game</h3>
            <p className="text-sm text-gray-400">
              Follow your custom practice plan to enhance your skills
            </p>
          </div>
          <Button asChild size="lg" className="bg-[#10B981] hover:bg-[#10B981]/90 text-white">
            <Link to="/my-practice-plans" className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              View Plan
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
