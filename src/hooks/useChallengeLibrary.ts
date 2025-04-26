
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
      
      console.log(`Fetched ${data?.length || 0} challenges`);
      return data as Challenge[];
    }
  });

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['user-challenge-progress'],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return [];
      }
      
      if (!session?.user?.id) {
        console.log("No user session found");
        return [];
      }
      
      const userId = session.user.id;
      console.log(`Fetching progress for user ID: ${userId}`);
      
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching progress:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your progress',
          variant: 'destructive',
        });
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} progress records:`, data);
      return data || [];
    },
    staleTime: 0, // Always refetch on component mount
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Ensure we have properly formatted progress data
  const formattedProgress: UserProgress[] = Array.isArray(progressData) ? progressData.map((item: any) => {
    if (!item) return null;
    console.log(`Formatting progress for challenge ${item.challenge_id}:`, item);
    
    return {
      challenge_id: item.challenge_id,
      best_score: item.best_score,
      recent_score: item.recent_score
    };
  }).filter(Boolean) : [];

  console.log("Formatted progress records:", formattedProgress);

  return {
    challenges: challenges || [],
    isLoading: challengesLoading || progressLoading,
    progress: formattedProgress
  };
};
