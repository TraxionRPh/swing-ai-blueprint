
import { useState } from "react";
import { Brain } from "@/components/icons/CustomIcons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DrillCarousel } from "./DrillCarousel";
import { Loading } from "@/components/ui/loading";

interface AISearchBarProps {
  onSearch: (query: string) => void;
  isAnalyzing: boolean;
}

export const AISearchBar = ({ onSearch, isAnalyzing }: AISearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendedDrills, setRecommendedDrills] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please describe your issue",
        description: "Tell us what's happening with your game and we'll find the best drills to help.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    onSearch(searchQuery);

    try {
      const { data, error } = await supabase.functions.invoke('search-drills', {
        body: { query: searchQuery }
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
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 border border-transparent bg-gradient-to-r p-[1px] from-[#9b87f5] to-[#D946EF] rounded-lg">
          <div className="bg-card h-full rounded-lg w-full flex flex-col">
            <Input
              placeholder="Describe your golf issue (e.g., 'I'm hitting behind the ball' or 'My drives are slicing')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 shadow-none focus-visible:ring-0"
            />
            <p className="text-xs text-muted-foreground px-3 pb-2">
              Try asking about specific issues like "topping my irons" or "three-putting too often"
            </p>
          </div>
        </div>
        <Button 
          onClick={handleAISearch}
          disabled={isSearching}
          className="bg-gradient-to-r from-[#9b87f5] to-[#D946EF] text-white hover:opacity-90"
        >
          <Brain className="mr-2 h-4 w-4" />
          {isSearching ? "Analyzing..." : "Analyze with AI"}
        </Button>
      </div>

      {isSearching ? (
        <Loading message="Finding the best drills for your issue..." />
      ) : (
        recommendedDrills.length > 0 && (
          <DrillCarousel drills={recommendedDrills} />
        )
      )}
    </div>
  );
};
