
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { useChallenge } from '@/hooks/useChallenge';
import { TrackingForm } from '@/components/challenge/TrackingForm';
import { compareScores } from '@/utils/scoreUtils';
import * as z from 'zod';

const ChallengeTracking = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPersisting, setIsPersisting] = useState(false);
  
  const { data: challenge, isLoading } = useChallenge(challengeId);

  const handleBack = () => {
    navigate(-1);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
        const bestScore = existingData.best_score 
          ? compareScores(existingData.best_score, scoreValue, challenge?.metric) 
            ? scoreValue 
            : existingData.best_score
          : scoreValue;
          
        const updateData = {
          best_score: bestScore,
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading challenge..." />
      </div>
    );
  }
  
  if (!challenge) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">Challenge not found</h2>
        <p className="text-muted-foreground mt-2">The challenge you're looking for couldn't be found.</p>
        <Button className="mt-4" onClick={handleBack}>Back to Challenges</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challenge Tracking</h1>
          <p className="text-muted-foreground">
            Record your results for this challenge
          </p>
        </div>
      </div>
      
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{challenge.title}</CardTitle>
            <Badge variant={
              challenge.difficulty === "Beginner" ? "outline" : 
              challenge.difficulty === "Intermediate" ? "secondary" : "default"
            }>
              {challenge.difficulty}
            </Badge>
          </div>
          <CardDescription>{challenge.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {challenge.instruction1 && <li>{challenge.instruction1}</li>}
              {challenge.instruction2 && <li>{challenge.instruction2}</li>}
              {challenge.instruction3 && <li>{challenge.instruction3}</li>}
            </ol>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <h3 className="text-lg font-medium w-full">Metrics</h3>
            {challenge.metrics && challenge.metrics.map((metric: string) => (
              <Badge key={metric} variant="secondary">{metric}</Badge>
            ))}
          </div>
          
          <TrackingForm onSubmit={onSubmit} isPersisting={isPersisting} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeTracking;
