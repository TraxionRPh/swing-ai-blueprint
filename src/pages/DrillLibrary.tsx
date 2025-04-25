
import React, { useState, useEffect } from "react";
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
import { DrillCard } from "@/components/drill-library/DrillCard";

const DrillLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedDrills, setRecommendedDrills] = useState<Drill[]>([]);
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: drills, isLoading } = useQuery({
    queryKey: ['drills'],
    queryFn: async () => {
      // Get all drills - make sure to set a high limit to get all records
      const { data, error } = await supabase
        .from('drills')
        .select('*')
        .limit(100);
      
      if (error) throw error;
      return data as Drill[];
    }
  });

  useEffect(() => {
    if (drills) {
      setFilteredDrills(filterDrills(drills));
    }
  }, [drills, searchQuery, selectedCategory, selectedDifficulty]);

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
  
  const filterDrills = (drillsToFilter: Drill[] = []) => {
    if (!drillsToFilter) return [];
    
    return drillsToFilter.filter(drill => {
      // Filter by search query
      const matchesSearch = !searchQuery || 
        drill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        drill.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drill.focus.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by category
      const matchesCategory = selectedCategory === 'all' || drill.category === selectedCategory;
      
      // Filter by difficulty
      const matchesDifficulty = !selectedDifficulty || drill.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
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
        {drills && (
          <DrillFilters 
            drills={drills} 
            filterDrills={(filtered) => {
              if (filtered) {
                setFilteredDrills(filtered);
              }
              return filteredDrills;
            }}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredDrills.map((drill) => (
            <DrillCard key={drill.id} drill={drill} />
          ))}
        </div>
        
        {filteredDrills.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No drills match your filters.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DrillLibrary;
