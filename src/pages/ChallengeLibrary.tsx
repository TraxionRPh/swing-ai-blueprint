
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/loading";
import { useNavigate } from "react-router-dom";

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
  best_score: string | null;
  recent_score: string | null;
};

const ChallengeCard = ({ challenge, progress }: { 
  challenge: Challenge; 
  progress?: UserProgress;
}) => {
  const navigate = useNavigate();

  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-500 hover:bg-emerald-600 text-white border-0";
      case "Intermediate":
        return "bg-amber-500 hover:bg-amber-600 text-white border-0";
      case "Advanced":
        return "bg-rose-500 hover:bg-rose-600 text-white border-0";
      default:
        return "bg-slate-500 hover:bg-slate-600 text-white border-0";
    }
  };

  const handleStartChallenge = () => {
    navigate(`/challenge-tracking/${challenge.id}`);
  };

  const handleViewHistory = () => {
    navigate(`/challenge-history/${challenge.id}`);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{challenge.title}</CardTitle>
          <Badge className={getDifficultyBadgeClass(challenge.difficulty)}>
            {challenge.difficulty}
          </Badge>
        </div>
        <CardDescription>Your Challenge Results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        <div className="space-y-2">
          {progress?.best_score && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Best Score:</span>
              <span className="text-muted-foreground">{progress.best_score}</span>
            </div>
          )}
          {progress?.recent_score && (
            <div className="flex justify-between text-sm">
              <span className="font-medium">Recent Score:</span>
              <span className="text-muted-foreground">{progress.recent_score}</span>
            </div>
          )}
          {!progress?.best_score && !progress?.recent_score && (
            <div className="text-sm text-muted-foreground">
              No attempts yet
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {challenge.metrics && challenge.metrics.map((metric: string) => (
            <Badge key={metric} variant="secondary">{metric}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="default" size="sm" className="flex-1" onClick={handleStartChallenge}>
          Start Challenge
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleViewHistory}>
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

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['user-challenge-progress'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Error fetching progress:', error);
        return [];
      }
      
      return data;
    }
  });

  if (challengesLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading challenges..." />
      </div>
    );
  }

  const challengesData = challenges || [];
  
  const formattedProgress: UserProgress[] = (progressData || []).map((item: any) => ({
    challenge_id: item.challenge_id,
    best_score: item.best_score,
    recent_score: item.best_score // Best score is also used as recent score for now
  }));

  return (
    <div className="w-full space-y-6">
      <div className="w-full">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Challenge Library</h1>
        <p className="text-muted-foreground">
          Track your progress with measurable golf challenges
        </p>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-background p-1">
          <TabsTrigger 
            value="all" 
            className="flex-none px-4 py-2 text-sm rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors border border-transparent data-[state=active]:border-primary/50"
          >
            All Challenges
          </TabsTrigger>
          {['driving', 'irons', 'chipping', 'putting'].map(category => (
            <TabsTrigger 
              key={category}
              value={category}
              className="flex-none px-4 py-2 text-sm rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-colors border border-transparent data-[state=active]:border-primary/50"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {challengesData.map(challenge => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                progress={formattedProgress.find(p => p.challenge_id === challenge.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        {['driving', 'irons', 'chipping', 'putting'].map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {challengesData
                .filter(c => c.category === category)
                .map(challenge => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                    progress={formattedProgress.find(p => p.challenge_id === challenge.id)}
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
