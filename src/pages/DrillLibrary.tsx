
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AISearchBar } from "@/components/drill-library/AISearchBar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { DrillFilters } from "@/components/drill-library/DrillFilters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DrillCarousel } from "@/components/drill-library/DrillCarousel";
import { Drill } from "@/types/drill";

const DrillLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedDrills, setRecommendedDrills] = useState<Drill[]>([]);
  const { toast } = useToast();

  const { data: drills, isLoading } = useQuery({
    queryKey: ['drills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drills')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const handleAISearch = async (query: string) => {
    setIsAnalyzing(true);
    setSearchQuery(query);
    
    try {
      const { data, error } = await supabase.functions.invoke('search-drills', {
        body: { query }
      });

      if (error) throw error;
      
      setRecommendedDrills(data.drills);
      
      toast({
        title: "Drills Found",
        description: "We've found the best drills to help with your issue.",
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to find matching drills. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
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
    <div className="space-y-8">
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

      {recommendedDrills.length > 0 && (
        <div className="my-8">
          <DrillCarousel drills={recommendedDrills} />
        </div>
      )}
      
      <ScrollArea className="h-[600px] rounded-md border p-4">
        <DrillFilters drills={drills} filterDrills={filterDrills} />
      </ScrollArea>
    </div>
  );
};

export default DrillLibrary;
