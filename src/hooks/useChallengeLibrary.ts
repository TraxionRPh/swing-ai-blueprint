
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Challenge, UserProgress } from "@/components/challenge/ChallengeCard";
import { useToast } from "@/hooks/use-toast";

export const useChallengeLibrary = () => {
  const { toast } = useToast();
  
  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*');
      
      if (error) {
        console.error('Error fetching challenges:', error);
        toast({
          title: 'Error',
          description: 'Failed to load challenges',
          variant: 'destructive',
        });
        throw error;
      }
      return data as Challenge[];
    }
  });

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['user-challenge-progress'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        console.log("No user session found");
        return [];
      }
      
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Error fetching progress:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your progress',
          variant: 'destructive',
        });
        return [];
      }
      
      console.log("User progress data:", data);
      return data;
    }
  });

  const formattedProgress: UserProgress[] = (progressData || []).map((item: any) => ({
    challenge_id: item.challenge_id,
    best_score: item.best_score,
    recent_score: item.recent_score
  }));

  console.log("Formatted progress:", formattedProgress);

  return {
    challenges: challenges || [],
    isLoading: challengesLoading || progressLoading,
    progress: formattedProgress
  };
};
