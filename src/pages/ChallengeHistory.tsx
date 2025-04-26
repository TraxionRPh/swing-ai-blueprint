
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { format } from 'date-fns';

type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  metrics: string[];
};

type ChallengeResult = {
  id: string;
  challenge_id: string;
  best_score: string;
  recent_score: string;
  created_at: string;
  updated_at: string;
};

const ChallengeHistory = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  
  // Fetch challenge details
  const { data: challenge, isLoading: isLoadingChallenge } = useQuery({
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
        return null;
      }
      
      return data as Challenge;
    },
  });
  
  // Fetch challenge progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['challenge-progress', challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('challenge_id', challengeId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Not found is OK
        console.error('Error fetching challenge progress:', error);
      }
      
      return data as ChallengeResult;
    },
  });
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleStartChallenge = () => {
    navigate(`/challenge-tracking/${challengeId}`);
  };
  
  if (isLoadingChallenge || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading challenge history..." />
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
          <h1 className="text-3xl font-bold tracking-tight">Challenge History</h1>
          <p className="text-muted-foreground">
            View your past results for this challenge
          </p>
        </div>
      </div>
      
      <Card>
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
          <div className="flex flex-wrap gap-2">
            {challenge.metrics && challenge.metrics.map((metric: string) => (
              <Badge key={metric} variant="secondary">{metric}</Badge>
            ))}
          </div>
          
          {progress ? (
            <div className="space-y-4 mt-4">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Your Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Best Score:</span>
                    <Badge variant="default">{progress.best_score}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Recent Score:</span>
                    <Badge variant="outline">{progress.recent_score}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Last Updated:
                    </span>
                    <span>{format(new Date(progress.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" onClick={handleStartChallenge}>
                Start Challenge Again
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <h3 className="text-lg font-medium mb-2">No attempts yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't attempted this challenge yet. Start now to track your progress!
              </p>
              <Button onClick={handleStartChallenge}>
                Start Challenge
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeHistory;
