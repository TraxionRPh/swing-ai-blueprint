import { useNavigate, useParams } from 'react-router-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { useChallenge } from '@/hooks/useChallenge';
import { TrackingForm } from '@/components/challenge/TrackingForm';
import { useSubmitChallenge } from '@/hooks/useSubmitChallenge';

const extractAttemptsFromInstructions = (challenge: any): number | undefined => {
  if (challenge.attempts && typeof challenge.attempts === 'number') {
    return challenge.attempts;
  }
  
  const instructions = [
    challenge.instruction1,
    challenge.instruction2,
    challenge.instruction3
  ];
  
  for (const instruction of instructions) {
    if (!instruction) continue;
    const match = instruction.match(/(\d+)\s*(?:balls?|drives?|shots?|attempts?)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return 10;
};

const ChallengeTracking = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { data: challenge, isLoading } = useChallenge(challengeId);
  const { onSubmit, isPersisting } = useSubmitChallenge(challengeId);

  const handleBack = () => {
    navigate(-1);
  };
  
  const totalAttempts = challenge ? extractAttemptsFromInstructions(challenge) : 10;
  
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
          
          <TrackingForm 
            onSubmit={onSubmit} 
            isPersisting={isPersisting} 
            totalAttempts={totalAttempts}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeTracking;
