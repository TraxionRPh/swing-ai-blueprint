
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Mock challenge data
const challenges = [
  {
    id: 1,
    title: "10 Up-and-Downs in a Row",
    description: "Test your short game by completing 10 consecutive up-and-downs.",
    difficulty: "Intermediate",
    category: "chipping",
    metrics: ["Success Rate", "Proximity", "Time"],
    progress: 40,
    bestScore: "8 consecutive"
  },
  {
    id: 2,
    title: "100 Putts from 6 Feet",
    description: "Build putting confidence by making 100 putts from 6 feet.",
    difficulty: "Beginner",
    category: "putting",
    metrics: ["Makes", "Streak", "Time"],
    progress: 65,
    bestScore: "65/100 completed"
  },
  {
    id: 3,
    title: "Fairway Finder",
    description: "Hit 20 drives that land in a 20-yard wide zone.",
    difficulty: "Advanced",
    category: "driving",
    metrics: ["Accuracy", "Distance", "Dispersion"],
    progress: 25,
    bestScore: "5/20 completed"
  },
  {
    id: 4,
    title: "Distance Control Challenge",
    description: "Hit to 4 different targets with 4 different clubs, scoring based on proximity.",
    difficulty: "Advanced",
    category: "irons",
    metrics: ["Accuracy", "Consistency", "Club Selection"],
    progress: 10,
    bestScore: "72 points"
  }
];

const ChallengeCard = ({ challenge }: { challenge: any }) => {
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
            <span>{challenge.progress}%</span>
          </div>
          <Progress value={challenge.progress} />
        </div>
        <div className="text-sm">
          <span className="font-medium">Best Result: </span>
          <span className="text-muted-foreground">{challenge.bestScore}</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {challenge.metrics.map((metric: string) => (
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
            {challenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="driving" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.filter(c => c.category === "driving").map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="irons" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.filter(c => c.category === "irons").map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="chipping" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.filter(c => c.category === "chipping").map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="putting" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.filter(c => c.category === "putting").map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengeLibrary;
