
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { Clock, Trash2 } from "lucide-react";
import { SavedPracticePlan } from "@/types/practice-plan";

interface PlanCardProps {
  plan: SavedPracticePlan;
  onView: (plan: SavedPracticePlan) => void;
  onDelete: (planId: string) => void;
}

export const PlanCard = ({ plan, onView, onDelete }: PlanCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{plan.problem}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}</span>
            </CardDescription>
          </div>
          <Badge variant="outline">
            {plan.practice_plan?.practicePlan?.duration || "1 day"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{plan.diagnosis}</p>
      </CardContent>
      <Separator />
      <CardFooter className="pt-4 flex justify-between">
        <Button onClick={() => onView(plan)} variant="outline">View Plan</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Practice Plan</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this practice plan? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(plan.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
