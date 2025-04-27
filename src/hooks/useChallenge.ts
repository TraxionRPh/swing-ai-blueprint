
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Challenge } from "@/types/challenge";
import { useToast } from "@/hooks/use-toast";

export const useChallenge = (challengeId: string | undefined) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      try {
        // First try to get a specific challenge by ID
        if (challengeId) {
          const { data: specificChallenge, error: specificError } = await supabase
            .from('challenges')
            .select('*')
            .eq('id', challengeId)
            .maybeSingle();
          
          if (specificChallenge) {
            console.log("Found specific challenge:", specificChallenge);
            return specificChallenge as Challenge;
          }
        }
        
        // If specific challenge not found or error, get a random challenge
        console.log("Fetching a random challenge");
        const { data: randomChallenge, error: randomError } = await supabase
          .from('challenges')
          .select('*')
          .limit(1);
        
        if (randomError || !randomChallenge?.length) {
          console.error('Error fetching challenge:', randomError || 'No challenges found');
          toast({
            title: 'Error',
            description: 'Failed to load challenge details',
            variant: 'destructive',
          });
          return null;
        }
        
        console.log("Found random challenge:", randomChallenge[0]);
        return randomChallenge[0] as Challenge;
      } catch (error) {
        console.error('Error in challenge query:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred loading challenge details',
          variant: 'destructive',
        });
        return null;
      }
    },
    staleTime: 60000, // 1 minute
  });
};
