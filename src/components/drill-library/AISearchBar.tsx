
import { useState } from "react";
import { Brain } from "@/components/icons/CustomIcons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AISearchBarProps {
  onSearch: (query: string) => void;
  isAnalyzing: boolean;
}

export const AISearchBar = ({ onSearch, isAnalyzing }: AISearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
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
    onSearch(searchQuery);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 border border-transparent bg-gradient-to-r p-[1px] from-[#9b87f5] to-[#D946EF] rounded-lg">
      <div className="flex-1 bg-card p-4 md:p-2 md:pl-4 rounded-l-lg w-full flex flex-col">
        <Input
          placeholder="Describe your golf issue (e.g., 'I'm hitting behind the ball' or 'My drives are slicing')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-0 shadow-none focus-visible:ring-0 px-0"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Try asking about specific issues like "topping my irons" or "three-putting too often"
        </p>
      </div>
      <Button 
        onClick={handleAISearch}
        disabled={isAnalyzing}
        className="md:w-auto w-full bg-primary hover:bg-primary/90 md:rounded-l-none"
      >
        <Brain className="mr-2 h-4 w-4" />
        {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
      </Button>
    </div>
  );
};
