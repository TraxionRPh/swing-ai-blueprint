
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';

export const formSchema = z.object({
  score: z.string()
    .min(1, 'Score is required')
});

export type FormSchema = z.infer<typeof formSchema>;

export const useSubmitChallenge = (challengeId: string | undefined) => {
  const [isPersisting, setIsPersisting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const onSubmit = async (values: FormSchema) => {
    if (!challengeId) return;
    
    setIsPersisting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error('User is not authenticated');
      }
      
      const userId = session.user.id;

      // First get the challenge to extract total attempts
      const { data: challenge } = await supabase
        .from('challenges')
        .select('instruction1, instruction2, instruction3')
        .eq('id', challengeId)
        .single();

      if (!challenge) {
        throw new Error('Challenge not found');
      }

      const instructions = [challenge.instruction1, challenge.instruction2, challenge.instruction3];
      const totalAttempts = instructions.reduce((found, instruction) => {
        if (found) return found;
        if (!instruction) return null;
        const match = instruction.match(/(\d+)\s*(?:balls?|drives?|shots?|attempts?)/i);
        return match ? parseInt(match[1], 10) : null;
      }, null as number | null) || 0;
      
      const { data: existingData } = await supabase
        .from('user_challenge_progress')
        .select('best_score')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .maybeSingle();
      
      const currentScore = Number(values.score);
      const bestScore = existingData?.best_score ? Math.max(currentScore, Number(existingData.best_score)) : currentScore;
      
      if (existingData) {
        await supabase
          .from('user_challenge_progress')
          .update({
            best_score: bestScore.toString(),
            recent_score: values.score,
            total_attempts: totalAttempts.toString(),
            updated_at: new Date().toISOString(),
            progress: 0,
          })
          .eq('challenge_id', challengeId)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_challenge_progress')
          .insert({
            challenge_id: challengeId,
            best_score: values.score,
            recent_score: values.score,
            total_attempts: totalAttempts.toString(),
            progress: 0,
            user_id: userId
          });
      }
      
      const percentage = Math.round((currentScore / totalAttempts) * 100);
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['user-challenge-progress'] });
      await queryClient.invalidateQueries({ queryKey: ['challenges'] });
      
      toast({
        title: 'Challenge complete!',
        description: `Score recorded: ${values.score}/${totalAttempts} (${percentage}%)`,
      });
      
      navigate('/challenges');
      
    } catch (error) {
      console.error('Error saving challenge progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your progress',
        variant: 'destructive',
      });
    } finally {
      setIsPersisting(false);
    }
  };

  return {
    onSubmit,
    isPersisting
  };
};
