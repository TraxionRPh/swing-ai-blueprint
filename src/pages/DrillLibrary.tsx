
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AISearchBar } from "@/components/drill-library/AISearchBar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { DrillFilters } from "@/components/drill-library/DrillFilters";

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
      
      <DrillFilters drills={drills} filterDrills={filterDrills} />
    </div>
  );
};

export default DrillLibrary;
