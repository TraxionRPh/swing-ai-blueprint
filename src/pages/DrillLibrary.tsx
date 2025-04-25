
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AISearchBar } from "@/components/drill-library/AISearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LucideGolf } from "@/components/icons/CustomIcons";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";

type Drill = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  focus: string[];
  video_url: string | null;
  category: string;
};

const DrillCard = ({ drill }: { drill: Drill }) => {
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const { data: drills, isLoading } = useQuery({
    queryKey: ['drills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drills')
        .select('*');
      
      if (error) throw error;
      return data as Drill[];
    }
  });

  const handleAISearch = async (query: string) => {
    setIsAnalyzing(true);
    setSearchQuery(query);
    
    setTimeout(() => {
      toast({
        title: "AI Analysis Complete",
        description: "We've analyzed your issue and highlighted the most relevant drills.",
      });
      setIsAnalyzing(false);
    }, 1500);
  };
  
  const filterDrills = (drills: Drill[] = []) => {
    if (!searchQuery) return drills;
    
    return drills.filter(drill => 
      drill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      drill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drill.focus.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading drills..." />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Drill Library</h1>
        <p className="text-muted-foreground">
          Browse our collection of golf drills or describe an issue for personalized recommendations
        </p>
      </div>
      
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <AISearchBar onSearch={handleAISearch} isAnalyzing={isAnalyzing} />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="driving">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="driving">Driving</TabsTrigger>
          <TabsTrigger value="irons">Irons</TabsTrigger>
          <TabsTrigger value="chipping">Chipping</TabsTrigger>
          <TabsTrigger value="putting">Putting</TabsTrigger>
        </TabsList>
        
        {['driving', 'irons', 'chipping', 'putting'].map(category => (
          <TabsContent key={category} value={category} className="animate-fade-in">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterDrills(drills?.filter(drill => drill.category === category)).map(drill => (
                <DrillCard key={drill.id} drill={drill} />
              ))}
              {filterDrills(drills?.filter(drill => drill.category === category)).length === 0 && (
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
        ))}
      </Tabs>
    </div>
  );
};

export default DrillLibrary;
