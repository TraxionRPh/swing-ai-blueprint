
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AISearchBar } from "@/components/drill-library/AISearchBar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Bug } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Drill } from "@/types/drill";
import { RecommendedDrillsSection } from "@/components/drill-library/RecommendedDrillsSection";
import { AllDrillsSection } from "@/components/drill-library/AllDrillsSection";
import { useAPIUsageCheck } from "@/hooks/useAPIUsageCheck";
import { useAuth } from "@/context/AuthContext";

const DrillLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedDrills, setRecommendedDrills] = useState<Drill[]>([]);
  const [searchAnalysis, setSearchAnalysis] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { toast } = useToast();
  const { checkAPIUsage } = useAPIUsageCheck();
  const { user } = useAuth();

  // Fetch all drills with React Query for automatic caching and state management
  const { data: drills, isLoading } = useQuery({
    queryKey: ['drills'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('drills')
          .select('*');
        
        if (error) throw error;
        console.log(`Fetched ${data?.length || 0} drills from the database`);
        return data as Drill[];
      } catch (error) {
        console.error('Error fetching drills:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes caching
  });

  // Memoized filter function to prevent unnecessary recalculations
  const filterDrills = useCallback((drillsToFilter: Drill[] = []) => {
    if (!drillsToFilter) return [];
    
    return drillsToFilter.filter(drill => {
      const matchesSearch = !searchQuery || 
        drill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        drill.overview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        // Safely check if focus exists and is an array before calling .some()
        (Array.isArray(drill.focus) && drill.focus.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = selectedCategory === 'all' || drill.category === selectedCategory;
      
      const matchesDifficulty = !selectedDifficulty || drill.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Memoize filtered drills to avoid unnecessary re-renders
  const filteredDrills = useMemo(() => {
    return filterDrills(drills);
  }, [drills, filterDrills]);

  // Optimized AI search function with API usage check
  const handleAISearch = useCallback(async (query: string) => {
    setIsAnalyzing(true);
    setSearchQuery(query);
    setSearchError(null);
    
    try {
      // Check API usage limits
      const canProceed = await checkAPIUsage(user?.id, 'ai_analysis');
      if (!canProceed) {
        setIsAnalyzing(false);
        return;
      }
      
      console.log("Sending search query to edge function:", query);
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
      setSearchError(error instanceof Error ? error.message : "Failed to search drills");
      toast({
        title: "Search Failed",
        description: "Failed to find matching drills. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [checkAPIUsage, user?.id, toast]);
  
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
          
          {searchError && (
            <Alert variant="destructive" className="mt-4">
              <Bug className="h-4 w-4" />
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>
                {searchError}. Please try again or browse drills below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <RecommendedDrillsSection 
        drills={recommendedDrills} 
        searchAnalysis={searchAnalysis} 
      />
      
      <AllDrillsSection
        drills={drills}
        filteredDrills={filteredDrills}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
      />
    </div>
  );
};

export default DrillLibrary;
