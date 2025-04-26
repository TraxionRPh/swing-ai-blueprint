
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Challenge } from "@/types/challenge";
import { useToast } from "@/hooks/use-toast";

export const useChallenge = (challengeId: string | undefined) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
      
      if (error) {
        console.error('Error fetching challenge:', error);
        toast({
          title: 'Error',
          description: 'Failed to load challenge details',
          variant: 'destructive',
        });
        return null;
      }
      
      return data as Challenge;
    },
  });
};
