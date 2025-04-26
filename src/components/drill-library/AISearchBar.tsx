
import { useState } from "react";
import { Brain } from "@/components/icons/CustomIcons";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAISearch();
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 border border-primary/50 bg-gradient-to-r p-[1px] from-[#9b87f5] to-[#D946EF] rounded-lg">
          <div className="bg-card rounded-lg w-full flex flex-col">
            <Textarea
              placeholder="Describe your golf issue in detail (e.g., 'I'm hitting behind the ball with my irons' or 'My drives are consistently slicing to the right')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm min-h-[100px] resize-y"
            />
          </div>
        </div>
        <Button 
          onClick={handleAISearch}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-[#9b87f5] to-[#D946EF] text-white hover:opacity-90 w-full md:w-auto"
        >
          <Brain className="mr-2 h-4 w-4" />
          {isAnalyzing ? "Analyzing..." : "Find Perfect Drills"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground px-3">
        For best results, be specific about your issue: mention club type, ball flight, and when the problem occurs
      </p>

      {isAnalyzing && (
        <Loading message="Analyzing your golf issue to find the most effective drills..." />
      )}
    </div>
  );
};
