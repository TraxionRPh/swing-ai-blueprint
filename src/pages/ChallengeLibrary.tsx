
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/loading";
import { ChallengeCard } from "@/components/challenge/ChallengeCard";
import { useChallengeLibrary } from "@/hooks/useChallengeLibrary";
import { useQueryClient } from "@tanstack/react-query";

const ChallengeLibrary = () => {
  const { challenges, isLoading, progress } = useChallengeLibrary();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredChallenges, setFilteredChallenges] = useState(challenges);
  const queryClient = useQueryClient();

  // Filter challenges when category or challenges change
  useEffect(() => {
    if (!challenges) return;
    
    if (selectedCategory === 'all') {
      setFilteredChallenges(challenges);
    } else {
      const filtered = challenges.filter(challenge => 
        challenge.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredChallenges(filtered);
    }
  }, [selectedCategory, challenges]);

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
      
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
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
        
        <div className="mt-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChallenges.map(challenge => {
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
        </div>
      </Tabs>
    </div>
  );
};

export default ChallengeLibrary;
