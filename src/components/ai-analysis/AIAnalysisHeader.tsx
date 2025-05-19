
import { Button } from "@/components/ui/button";
import { RefreshCw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AIAnalysisHeaderProps {
  isGenerating: boolean;
  onRefresh: () => void;
  apiUsageInfo?: {
    currentUsage?: number;
    dailyLimit?: number;
  };
}

export const AIAnalysisHeader = ({ 
  isGenerating, 
  onRefresh,
  apiUsageInfo 
}: AIAnalysisHeaderProps) => {
  const showUsageInfo = apiUsageInfo && apiUsageInfo.currentUsage !== undefined && apiUsageInfo.dailyLimit !== undefined;
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
          AI Analysis
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Personalized insights based on your actual performance data
          {showUsageInfo && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({apiUsageInfo.currentUsage}/{apiUsageInfo.dailyLimit} uses today)
            </span>
          )}
        </p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onRefresh} 
              disabled={isGenerating}
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Analyzing...' : 'Update Analysis'}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Generate a new AI analysis of your golf performance</p>
            {showUsageInfo && (
              <p className="text-xs mt-1">
                {apiUsageInfo.currentUsage} of {apiUsageInfo.dailyLimit} daily analyses used
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
