
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';

type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  metrics: string[];
  metric: string;
  instruction1?: string;
  instruction2?: string;
  instruction3?: string;
};

// Form schema
const formSchema = z.object({
  score: z.string().min(1, 'Score is required'),
  notes: z.string().optional(),
});

const ChallengeTracking = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPersisting, setIsPersisting] = useState(false);

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      score: '',
      notes: '',
    },
  });

  // Fetch challenge details
  const { data: challenge, isLoading } = useQuery({
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

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Submit form
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!challengeId) return;
    
    setIsPersisting(true);
    
    try {
      // First check if there's an existing record
      const { data: existingData } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('challenge_id', challengeId)
        .maybeSingle();
      
      const scoreValue = values.score;
      
      if (existingData) {
        // Update existing progress
        const bestScore = existingData.best_score 
          ? compareScores(existingData.best_score, scoreValue, challenge?.metric) 
            ? scoreValue 
            : existingData.best_score
          : scoreValue;
          
        const updateData = {
          best_score: bestScore,
          updated_at: new Date().toISOString(),
          progress: 0, // Default value to maintain compatibility
        };
        
        // Add recent_score if your table supports it
        // First check if the column exists in your database schema
        try {
          await supabase
            .from('user_challenge_progress')
            .update({
              ...updateData,
              recent_score: scoreValue,
            })
            .eq('challenge_id', challengeId);
        } catch (error) {
          // If error occurs, try without recent_score (it might not exist in the schema)
          await supabase
            .from('user_challenge_progress')
            .update(updateData)
            .eq('challenge_id', challengeId);
          
          console.log('Updated without recent_score as it may not exist in the schema');
        }
      } else {
        // Create new progress entry with only the fields that are guaranteed to exist
        await supabase
          .from('user_challenge_progress')
          .insert({
            challenge_id: challengeId,
            best_score: scoreValue,
            progress: 0, // Default value to maintain compatibility
          });
      }
      
      toast({
        title: 'Challenge complete!',
        description: 'Your progress has been saved',
      });
      
      // Navigate back to the challenge library after a short delay
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
  
  // Helper function to compare scores based on metric type
  // For golf, lower is usually better (except for metrics like "distance")
  const compareScores = (oldScore: string, newScore: string, metric?: string): boolean => {
    // Default behavior: lower score is better
    const parseScore = (score: string) => {
      // Handle percentage scores
      if (score.includes('%')) {
        return parseFloat(score);
      }
      // Handle distance scores
      else if (score.includes('yards') || score.includes('yd')) {
        return parseFloat(score);
      }
      // Handle numeric scores
      else {
        return parseFloat(score);
      }
    };
    
    const oldValue = parseScore(oldScore);
    const newValue = parseScore(newScore);
    
    // For distance metrics, higher is better
    if (metric && ['distance', 'yards', 'feet'].some(m => metric.toLowerCase().includes(m))) {
      return newValue > oldValue;
    }
    
    // For accuracy metrics, higher percentage is better
    if (metric && ['accuracy', 'percentage', 'success'].some(m => metric.toLowerCase().includes(m))) {
      return newValue > oldValue;
    }
    
    // Default: lower is better (like golf scores)
    return newValue < oldValue;
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
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Score</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 7 out of 10" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter your performance result for this challenge
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any notes about your performance..." 
                        {...field}
                        className="min-h-[100px]" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isPersisting}
              >
                {isPersisting ? (
                  <Loading message="Saving..." />
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Complete Challenge
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeTracking;
