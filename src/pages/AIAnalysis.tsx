
import { useState } from "react";
import { PerformanceRadarChart } from "@/components/ai-analysis/PerformanceRadarChart";
import { ConfidenceChart } from "@/components/ai-analysis/ConfidenceChart";
import { IdentifiedIssues, Issue } from "@/components/ai-analysis/IdentifiedIssues";
import { PracticeRecommendations } from "@/components/ai-analysis/PracticeRecommendations";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info } from "lucide-react";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AIAnalysis = () => {
  const { 
    analysis, 
    isLoading, 
    isGenerating, 
    generateAnalysis, 
    aiConfidenceHistory 
  } = useAIAnalysis();
  
  // Show loading state when either loading or generating is true
  if (isLoading || isGenerating) {
    return (
      <Loading 
        message={isGenerating 
          ? "AI is analyzing your performance data..." 
          : "Loading your golf performance data..."
        } 
        className="min-h-[80vh] flex flex-col items-center justify-center" 
      />
    );
  }

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">AI Analysis</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Personalized insights based on your actual performance data
          </p>
        </div>
        <Button 
          onClick={() => generateAnalysis()} 
          disabled={isGenerating}
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analyzing...' : 'Update Analysis'}
        </Button>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3 text-sm border border-muted">
        <Info className="h-5 w-5 text-muted-foreground" />
        <p className="text-muted-foreground">
          AI analysis improves as you track more rounds and practice sessions. 
          The confidence score reflects how much data our AI has to assess your game.
        </p>
      </div>
      
      {!analysis ? (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">No Analysis Yet</CardTitle>
            <CardDescription>
              Click "Generate Analysis" to get your personalized golf performance insights
              based on your tracked rounds and practice data.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-12">
            <Button 
              onClick={() => generateAnalysis()} 
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? 'Analyzing...' : 'Generate Analysis'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <PerformanceRadarChart data={analysis.performanceAnalysis} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      <ConfidenceChart confidenceData={aiConfidenceHistory} currentConfidence={analysis.aiConfidence} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>This represents how confident the AI is in its analysis of your golf game based on the amount of data available. The more rounds and practice sessions you track, the more accurate the analysis becomes.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <IdentifiedIssues issues={analysis.identifiedIssues as Issue[]} />
          </div>
          
          <PracticeRecommendations recommendations={analysis.recommendedPractice} />
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
