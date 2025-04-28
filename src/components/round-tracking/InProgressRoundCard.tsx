
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
    
    try {
      setIsLoading(true);
      
      toast({
        title: "Loading round",
        description: "Retrieving your round data..."
      });
      
      // Add a small delay to let the toast show before navigation
      setTimeout(() => {
        // Use direct navigation to prevent potential React Router issues
        navigate(`/rounds/${roundId}`, { replace: true });
      }, 300);
    } catch (error) {
      console.error("Navigation error:", error);
      setIsLoading(false);
      
      toast({
        title: "Navigation error",
        description: "There was an issue loading this round. Please try again.",
        variant: "destructive"
      });
      
      // Fallback to direct location change if navigate fails
      setTimeout(() => {
        window.location.href = `/rounds/${roundId}`;
      }, 1000);
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
