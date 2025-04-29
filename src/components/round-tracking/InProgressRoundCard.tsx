
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface InProgressRoundProps {
  roundId: string;
  courseName: string;
  lastHole: number;
  holeCount: number;
  onDelete?: () => void;
}

export const InProgressRoundCard = ({ 
  roundId, 
  courseName, 
  lastHole, 
  holeCount,
  onDelete 
}: InProgressRoundProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResumeRound = () => {
    console.log("Resume round clicked for round ID:", roundId);
    console.log("Last completed hole:", lastHole);
    
    try {
      setIsLoading(true);
      
      toast({
        title: "Loading round",
        description: "Retrieving your round data..."
      });
      
      // Calculate the next hole to resume play at:
      // If lastHole is 8, we want to go to hole 9 (so we use lastHole + 1)
      // Unless that's beyond the hole count
      // If no holes completed yet (lastHole === 0), start at hole 1
      const nextHole = lastHole === 0 ? 1 : Math.min(lastHole + 1, holeCount);
      
      console.log("Resuming at hole:", nextHole);
      
      // Use both sessionStorage and localStorage to improve reliability
      // This will be read by useHoleNavigation
      sessionStorage.setItem('resume-hole-number', nextHole.toString());
      localStorage.setItem('resume-hole-number', nextHole.toString());
      
      // Add a small delay to let the toast show before navigation
      setTimeout(() => {
        navigate(`/rounds/${roundId}`);
      }, 300);
    } catch (error) {
      console.error("Navigation error:", error);
      setIsLoading(false);
      
      toast({
        title: "Navigation error",
        description: "There was an issue loading this round. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card className="mb-6 bg-primary/5 border-primary/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Resume Round</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete round</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <p className="text-sm text-muted-foreground">
              You have an incomplete round at <span className="font-medium text-foreground">{courseName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Progress: {lastHole} of {holeCount} holes completed
            </p>
            <Button 
              onClick={handleResumeRound} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Round...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Continue Round
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Round</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this round? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete?.();
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
