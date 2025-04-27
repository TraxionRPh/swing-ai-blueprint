
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AIAnalysisHeaderProps {
  isGenerating: boolean;
  onRefresh: () => void;
}

export const AIAnalysisHeader = ({ isGenerating, onRefresh }: AIAnalysisHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
          AI Analysis
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Personalized insights based on your actual performance data
        </p>
      </div>
      <Button 
        onClick={onRefresh} 
        disabled={isGenerating}
        size="sm"
        className="gap-2 bg-primary hover:bg-primary/90"
      >
        <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
        {isGenerating ? 'Analyzing...' : 'Update Analysis'}
      </Button>
    </div>
  );
};
