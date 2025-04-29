
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useRoundDeletion = (setCurrentRoundId: (id: string | null) => void) => {
  const { toast } = useToast();

  const deleteRound = async (roundId: string) => {
    try {
      // Delete hole scores first due to foreign key constraints
      const { error: holeScoresError } = await supabase
        .from('hole_scores')
        .delete()
        .eq('round_id', roundId);

      if (holeScoresError) throw holeScoresError;

      // Then delete the round
      const { error: roundError } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId);

      if (roundError) throw roundError;

      setCurrentRoundId(null);
      
      toast({
        title: "Round Deleted",
        description: "The round has been successfully deleted",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting round:', error);
      toast({
        title: "Error deleting round",
        description: "Could not delete the round. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { deleteRound };
};
