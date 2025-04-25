
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LucideGolf } from "@/components/icons/CustomIcons";

// Mock data
const drillsData = {
  driving: [
    {
      id: 1,
      title: "Alignment Stick Path",
      description: "Place alignment sticks on the ground to visualize and train your swing path.",
      difficulty: "Beginner",
      duration: "10 mins",
      focus: ["Path", "Alignment"],
      videoUrl: "#"
    },
    {
      id: 2,
      title: "Tempo Training",
      description: "Practice your swing tempo with a metronome to develop consistency.",
      difficulty: "Intermediate",
      duration: "15 mins",
      focus: ["Tempo", "Rhythm"],
      videoUrl: "#"
    },
    {
      id: 3,
      title: "Half-Swing Power",
      description: "Build control and power using only half swings to maximize efficiency.",
      difficulty: "Advanced",
      duration: "20 mins",
      focus: ["Power", "Control"],
      videoUrl: "#"
    }
  ],
  irons: [
    {
      id: 4,
      title: "Ball Position Ladder",
      description: "Use alignment sticks to create a ladder and practice different ball positions.",
      difficulty: "Intermediate",
      duration: "15 mins",
      focus: ["Contact", "Ball Position"],
      videoUrl: "#"
    },
    {
      id: 5,
      title: "Distance Control",
      description: "Hit to specific targets to improve your distance control with irons.",
      difficulty: "Intermediate",
      duration: "20 mins",
      focus: ["Distance", "Accuracy"],
      videoUrl: "#"
    }
  ],
  chipping: [
    {
      id: 6,
      title: "Chip-It Circle",
      description: "Place targets in a circle around the hole at different distances.",
      difficulty: "Beginner",
      duration: "15 mins",
      focus: ["Touch", "Accuracy"],
      videoUrl: "#"
    },
    {
      id: 7,
      title: "Up-and-Down Challenge",
      description: "Practice getting up and down from various lies around the green.",
      difficulty: "Advanced",
      duration: "25 mins",
      focus: ["Versatility", "Scoring"],
      videoUrl: "#"
    }
  ],
  putting: [
    {
      id: 8,
      title: "Gate Drill",
      description: "Set up tees as a gate that the ball must roll through to improve accuracy.",
      difficulty: "Beginner",
      duration: "10 mins",
      focus: ["Direction", "Stroke"],
      videoUrl: "#"
    },
    {
      id: 9,
      title: "Clock Drill",
      description: "Place balls in a clock formation to practice putts from all angles.",
      difficulty: "Intermediate",
      duration: "20 mins",
      focus: ["Distance", "Reading"],
      videoUrl: "#"
    }
  ]
};

const DrillCard = ({ drill }: { drill: any }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{drill.title}</CardTitle>
          <Badge variant={
            drill.difficulty === "Beginner" ? "outline" : 
            drill.difficulty === "Intermediate" ? "secondary" : "default"
          }>
            {drill.difficulty}
          </Badge>
        </div>
        <CardDescription>{drill.duration}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{drill.description}</p>
        <div className="flex flex-wrap gap-2">
          {drill.focus.map((tag: string) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" size="sm" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

const DrillLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filterDrills = (drills: any[]) => {
    if (!searchQuery) return drills;
    
    return drills.filter(drill => 
      drill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      drill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drill.focus.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Drill Library</h1>
        <p className="text-muted-foreground">
          Browse our collection of golf drills to improve your game
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search drills by name, description, or focus area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        {searchQuery && (
          <Button variant="ghost" onClick={() => setSearchQuery("")}>
            Clear
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="driving">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="driving">Driving</TabsTrigger>
          <TabsTrigger value="irons">Irons</TabsTrigger>
          <TabsTrigger value="chipping">Chipping</TabsTrigger>
          <TabsTrigger value="putting">Putting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="driving" className="animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterDrills(drillsData.driving).map(drill => (
              <DrillCard key={drill.id} drill={drill} />
            ))}
            {filterDrills(drillsData.driving).length === 0 && (
              <div className="col-span-full text-center py-10">
                <LucideGolf className="mx-auto h-12 w-12 text-muted-foreground/60" />
                <h3 className="mt-4 text-lg font-medium">No drills found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="irons" className="animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterDrills(drillsData.irons).map(drill => (
              <DrillCard key={drill.id} drill={drill} />
            ))}
            {filterDrills(drillsData.irons).length === 0 && (
              <div className="col-span-full text-center py-10">
                <LucideGolf className="mx-auto h-12 w-12 text-muted-foreground/60" />
                <h3 className="mt-4 text-lg font-medium">No drills found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="chipping" className="animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterDrills(drillsData.chipping).map(drill => (
              <DrillCard key={drill.id} drill={drill} />
            ))}
            {filterDrills(drillsData.chipping).length === 0 && (
              <div className="col-span-full text-center py-10">
                <LucideGolf className="mx-auto h-12 w-12 text-muted-foreground/60" />
                <h3 className="mt-4 text-lg font-medium">No drills found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="putting" className="animate-fade-in">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filterDrills(drillsData.putting).map(drill => (
              <DrillCard key={drill.id} drill={drill} />
            ))}
            {filterDrills(drillsData.putting).length === 0 && (
              <div className="col-span-full text-center py-10">
                <LucideGolf className="mx-auto h-12 w-12 text-muted-foreground/60" />
                <h3 className="mt-4 text-lg font-medium">No drills found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DrillLibrary;
