
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useRoundDeletion = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Delete a round
  const deleteRound = useCallback(async (roundId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete a round",
        variant: "destructive"
      });
      return false;
    }

    try {
      // First delete all hole scores for this round
      const { error: scoresError } = await supabase
        .from('hole_scores')
        .delete()
        .eq('round_id', roundId);
        
      if (scoresError) {
        console.error("Error deleting hole scores:", scoresError);
        toast({
          title: "Error Deleting Round",
          description: "Could not delete hole scores. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      // Then delete the round itself
      const { error: roundError } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);
        
      if (roundError) {
        console.error("Error deleting round:", roundError);
        toast({
          title: "Error Deleting Round",
          description: "Could not delete round. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Round Deleted",
        description: "Your round has been deleted successfully!",
      });
      
      return true;
    } catch (error) {
      console.error("Error in deleteRound:", error);
      toast({
        title: "Error Deleting Round",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, user]);

  return { deleteRound };
};
