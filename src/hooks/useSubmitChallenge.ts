
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
    if (!challengeId) {
      console.error('No challenge ID provided');
      return;
    }
    
    setIsPersisting(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error');
      }
      
      if (!session?.user?.id) {
        console.error('User not authenticated');
        throw new Error('User is not authenticated');
      }
      
      const userId = session.user.id;
      console.log(`Processing challenge submission for user ${userId}, challenge ${challengeId}`);

      // First get the challenge to extract total attempts
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('instruction1, instruction2, instruction3')
        .eq('id', challengeId)
        .single();

      if (challengeError) {
        console.error('Error fetching challenge:', challengeError);
        throw new Error('Challenge not found');
      }

      if (!challenge) {
        console.error('Challenge data is null');
        throw new Error('Challenge not found');
      }

      const instructions = [challenge.instruction1, challenge.instruction2, challenge.instruction3];
      const totalAttempts = instructions.reduce((found, instruction) => {
        if (found) return found;
        if (!instruction) return null;
        const match = instruction.match(/(\d+)\s*(?:balls?|drives?|shots?|attempts?)/i);
        return match ? parseInt(match[1], 10) : null;
      }, null as number | null) || 0;
      
      const currentScore = Number(values.score);
      
      // Check for existing progress record
      const { data: existingData, error: existingError } = await supabase
        .from('user_challenge_progress')
        .select('best_score, recent_score')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingError) {
        console.error('Error fetching existing progress:', existingError);
      }
      
      console.log('Existing progress data:', existingData);
      
      // Ensure scores are properly formatted as strings
      const scoreString = values.score.toString();
      
      // Calculate best score (comparing as numbers but storing as strings)
      let bestScore = scoreString;
      if (existingData?.best_score) {
        const existingBest = Number(existingData.best_score);
        bestScore = Math.max(currentScore, existingBest).toString();
      }
      
      console.log(`Current score: ${scoreString}, Best score: ${bestScore}`);
      
      if (existingData) {
        console.log('Updating existing progress record');
        const { error: updateError } = await supabase
          .from('user_challenge_progress')
          .update({
            best_score: bestScore,
            recent_score: scoreString,
            updated_at: new Date().toISOString(),
          })
          .eq('challenge_id', challengeId)
          .eq('user_id', userId);
          
        if (updateError) {
          console.error('Error updating progress:', updateError);
          throw updateError;
        }
      } else {
        console.log('Creating new progress record');
        const { error: insertError } = await supabase
          .from('user_challenge_progress')
          .insert({
            challenge_id: challengeId,
            user_id: userId,
            best_score: scoreString,
            recent_score: scoreString,
            progress: 0,
          });
          
        if (insertError) {
          console.error('Error inserting progress:', insertError);
          throw insertError;
        }
      }
      
      const percentage = Math.round((currentScore / totalAttempts) * 100);
      
      // Force immediate refetching of the data
      console.log('Invalidating queries to refresh data');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-challenge-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['challenges'] })
      ]);
      
      toast({
        title: 'Challenge complete!',
        description: `Score recorded: ${scoreString}/${totalAttempts} (${percentage}%)`,
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
