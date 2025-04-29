
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
import { supabase } from "@/integrations/supabase/client";

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
  const isMountedRef = useRef(true);
  const { toast } = useToast();

  // Ensure we clean up properly when component unmounts
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Prefetch round data when component mounts to speed up loading
  useEffect(() => {
    // Silently prefetch hole scores data
    const prefetchData = async () => {
      try {
        console.log("Prefetching round data for:", roundId);
        await Promise.all([
          // Prefetch hole scores
          supabase.from('hole_scores').select('*').eq('round_id', roundId),
          // Prefetch round details
          supabase.from('rounds').select('*').eq('id', roundId)
        ]);
        console.log("Prefetch complete for round:", roundId);
      } catch (error) {
        // Silent fail - this is just optimization
        console.log("Prefetch failed silently:", error);
      }
    };
    
    prefetchData();
  }, [roundId]);

  const handleResumeRound = () => {
    console.log("Resume round clicked for round ID:", roundId);
    console.log("Last completed hole:", lastHole);
    
    try {
      setIsLoading(true);
      
      // Show a toast with neutral variant instead of error
      toast({
        title: "Loading round",
        description: "Retrieving your round data..."
      });
      
      // Calculate the next hole to resume play at
      const nextHole = lastHole === 0 ? 1 : Math.min(lastHole + 1, holeCount);
      
      console.log("Resuming at hole:", nextHole);
      
      // Use both sessionStorage and localStorage to improve reliability
      sessionStorage.setItem('resume-hole-number', nextHole.toString());
      localStorage.setItem('resume-hole-number', nextHole.toString());
      
      // Clear any existing error flags that might exist in storage
      localStorage.removeItem('round-loading-error');
      sessionStorage.removeItem('round-loading-error');
      
      // Add a small delay to let the toast show before navigation
      setTimeout(() => {
        if (isMountedRef.current) {
          navigate(`/rounds/${roundId}`);
        }
      }, 300);
    } catch (error) {
      console.error("Navigation error:", error);
      if (isMountedRef.current) {
        setIsLoading(false);
        
        toast({
          title: "Navigation error",
          description: "There was an issue loading this round. Please try again.",
          variant: "destructive"
        });
      }
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
