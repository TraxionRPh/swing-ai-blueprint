
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
import { AlertCircle, MoveDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DrillLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedDrills, setRecommendedDrills] = useState<Drill[]>([]);
  const [searchAnalysis, setSearchAnalysis] = useState<string>("");
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
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
      
      if (data.drills && Array.isArray(data.drills)) {
        setRecommendedDrills(data.drills);
        setSearchAnalysis(data.analysis || "");
        
        if (data.drills.length > 0) {
          toast({
            title: `${data.drills.length} Drills Found`,
            description: "We've found the perfect drills to help with your issue.",
          });
          
          // Auto-scroll to results
          setTimeout(() => {
            const resultsSection = document.getElementById('recommended-drills');
            if (resultsSection) {
              resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        } else {
          toast({
            title: "No matching drills found",
            description: "Try rephrasing your issue or using different terms.",
            variant: "destructive"
          });
        }
      } else {
        throw new Error("Invalid response format");
      }
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
      const matchesSearch = !searchQuery || 
        drill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        drill.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // Safely check if focus exists and is an array before calling .some()
        (Array.isArray(drill.focus) && drill.focus.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = selectedCategory === 'all' || drill.category === selectedCategory;
      
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
        <div id="recommended-drills" className="my-8 scroll-mt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Recommended Drills for Your Issue</h2>
            
            {searchAnalysis && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Coach's Analysis</AlertTitle>
                <AlertDescription className="text-blue-700">
                  {searchAnalysis}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MoveDown className="h-4 w-4" />
              <p>Swipe through these personalized recommendations or create a complete practice plan</p>
            </div>
          </div>
          
          <DrillCarousel drills={recommendedDrills} />
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4">All Drills</h2>
        <ScrollArea className="h-[600px]">
          {drills && (
            <DrillFilters 
              drills={drills}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
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
    </div>
  );
};

export default DrillLibrary;
