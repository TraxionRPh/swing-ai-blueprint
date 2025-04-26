
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';

export const formSchema = z.object({
  score: z.string()
    .min(1, 'Score is required')
    .transform((val) => parseInt(val, 10))
});

export type FormSchema = z.infer<typeof formSchema>;

export const useSubmitChallenge = (challengeId: string | undefined) => {
  const [isPersisting, setIsPersisting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        .select('*')
        .eq('challenge_id', challengeId)
        .maybeSingle();
      
      if (existingData) {
        await supabase
          .from('user_challenge_progress')
          .update({
            best_score: values.score,
            total_attempts: totalAttempts,
            updated_at: new Date().toISOString(),
            progress: 0,
          })
          .eq('challenge_id', challengeId);
      } else {
        await supabase
          .from('user_challenge_progress')
          .insert({
            challenge_id: challengeId,
            best_score: values.score,
            total_attempts: totalAttempts,
            progress: 0,
            user_id: userId
          });
      }
      
      toast({
        title: 'Challenge complete!',
        description: `Score recorded: ${values.score}/${totalAttempts} (${Math.round((values.score / totalAttempts) * 100)}%)`,
      });
      
      setTimeout(() => {
        navigate('/challenges');
      }, 1500);
      
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
