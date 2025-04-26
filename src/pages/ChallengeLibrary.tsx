
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loading } from "@/components/ui/loading";

type Challenge = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  metrics: string[];
};

type UserProgress = {
  challenge_id: string;
  progress: number;
  best_score: string | null;
};

const ChallengeCard = ({ challenge, progress }: { 
  challenge: Challenge; 
  progress?: UserProgress;
}) => {
  return (
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
        <CardDescription>Track your progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress?.progress || 0}%</span>
          </div>
          <Progress value={progress?.progress || 0} />
        </div>
        {progress?.best_score && (
          <div className="text-sm">
            <span className="font-medium">Best Result: </span>
            <span className="text-muted-foreground">{progress.best_score}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          {challenge.metrics && challenge.metrics.map((metric: string) => (
            <Badge key={metric} variant="secondary">{metric}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="default" size="sm" className="flex-1">
          Start Challenge
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          View History
        </Button>
      </CardFooter>
    </Card>
  );
};

const ChallengeLibrary = () => {
  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*');
      
      if (error) throw error;
      return data as Challenge[];
    }
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['user-challenge-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*');
      
      if (error) throw error;
      return data as UserProgress[];
    }
  });

  if (challengesLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading challenges..." />
      </div>
    );
  }

  // Ensure we have challenge data before rendering
  const challengesData = challenges || [];
  const progressData = progress || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Challenge Library</h1>
        <p className="text-muted-foreground">
          Track your progress with measurable golf challenges
        </p>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Challenges</TabsTrigger>
          <TabsTrigger value="driving">Driving</TabsTrigger>
          <TabsTrigger value="irons">Irons</TabsTrigger>
          <TabsTrigger value="chipping">Chipping</TabsTrigger>
          <TabsTrigger value="putting">Putting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challengesData.map(challenge => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                progress={progressData.find(p => p.challenge_id === challenge.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        {['driving', 'irons', 'chipping', 'putting'].map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challengesData
                .filter(c => c.category === category)
                .map(challenge => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                    progress={progressData.find(p => p.challenge_id === challenge.id)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ChallengeLibrary;
