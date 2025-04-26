
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/loading";
import { ChallengeCard } from "@/components/challenge/ChallengeCard";
import { useChallengeLibrary } from "@/hooks/useChallengeLibrary";
import { useQueryClient } from "@tanstack/react-query";

const ChallengeLibrary = () => {
  const { challenges, isLoading, progress } = useChallengeLibrary();
  const queryClient = useQueryClient();

  // Force refresh data when component mounts
  useEffect(() => {
    const refreshData = async () => {
      console.log("Manual refresh of challenge data");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-challenge-progress'] }),
        queryClient.invalidateQueries({ queryKey: ['challenges'] })
      ]);
    };
    
    refreshData();
  }, [queryClient]);

  console.log(`ChallengeLibrary: ${challenges.length} challenges, ${progress.length} progress records`);
  console.log("Progress data:", progress);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading challenges..." />
      </div>
    );
  }

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
            {challenges.map(challenge => {
              const challengeProgress = progress.find(p => p.challenge_id === challenge.id);
              console.log(`Challenge ${challenge.id} progress:`, challengeProgress);
              
              return (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge}
                  progress={challengeProgress}
                />
              );
            })}
          </div>
        </TabsContent>
        
        {['driving', 'irons', 'chipping', 'putting'].map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {challenges
                .filter(c => c.category === category)
                .map(challenge => {
                  const challengeProgress = progress.find(p => p.challenge_id === challenge.id);
                  return (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge}
                      progress={challengeProgress}
                    />
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ChallengeLibrary;
