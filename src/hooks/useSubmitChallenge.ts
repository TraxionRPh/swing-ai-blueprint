
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';

export const formSchema = z.object({
  score: z.string().min(1, 'Score is required'),
  notes: z.string().optional(),
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
      
      const { data: existingData } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('challenge_id', challengeId)
        .maybeSingle();
      
      const scoreValue = values.score;
      
      if (existingData) {
        const updateData = {
          best_score: scoreValue,
          updated_at: new Date().toISOString(),
          progress: 0,
        };
        
        await supabase
          .from('user_challenge_progress')
          .update(updateData)
          .eq('challenge_id', challengeId);
        
      } else {
        await supabase
          .from('user_challenge_progress')
          .insert({
            challenge_id: challengeId,
            best_score: scoreValue,
            progress: 0,
            user_id: userId
          });
      }
      
      toast({
        title: 'Challenge complete!',
        description: 'Your progress has been saved',
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
