
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { HoleData } from "@/types/round-tracking";

export const useRoundCompletion = (currentRoundId: string | null, setCurrentRoundId: (id: string | null) => void) => {
  const { toast } = useToast();

  const finishRound = async (holeScores: HoleData[], holeCount: number) => {
    if (!currentRoundId) return false;

    try {
      console.log("Finishing round with ID:", currentRoundId);
      console.log("Hole scores:", holeScores.slice(0, holeCount));
      console.log("Hole count:", holeCount);
      
      // Only consider holes up to the hole count limit
      const relevantScores = holeScores.slice(0, holeCount);
      
      const totalScore = relevantScores.reduce((sum, hole) => sum + (hole.score || 0), 0);
      const totalPutts = relevantScores.reduce((sum, hole) => sum + (hole.putts || 0), 0);
      const fairwaysHit = relevantScores.filter(hole => hole.fairwayHit).length;
      const greensInRegulation = relevantScores.filter(hole => hole.greenInRegulation).length;
      
      const updateResult = await supabase
        .from('rounds')
        .update({ 
          total_score: totalScore,
          total_putts: totalPutts,
          fairways_hit: fairwaysHit,
          greens_in_regulation: greensInRegulation,
          hole_count: holeCount
        })
        .eq('id', currentRoundId);
        
      if (updateResult.error) {
        console.error('Error updating round:', updateResult.error);
        throw updateResult.error;
      }
      
      console.log("Round successfully updated with final scores:", updateResult);

      toast({
        title: "Round Completed",
        description: "Your round has been saved successfully!"
      });

      setCurrentRoundId(null);
      return true;
    } catch (error) {
      console.error('Error finishing round:', error);
      toast({
        title: "Error finishing round",
        description: "Could not save round details. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { finishRound };
};
