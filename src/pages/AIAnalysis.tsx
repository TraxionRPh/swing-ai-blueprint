
import { useState } from "react";
import { PerformanceRadarChart } from "@/components/ai-analysis/PerformanceRadarChart";
import { ConfidenceChart } from "@/components/ai-analysis/ConfidenceChart";
import { IdentifiedIssues } from "@/components/ai-analysis/IdentifiedIssues";
import { PracticeRecommendations } from "@/components/ai-analysis/PracticeRecommendations";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AIAnalysis = () => {
  const { 
    analysis, 
    isLoading, 
    isGenerating, 
    generateAnalysis, 
    aiConfidenceHistory 
  } = useAIAnalysis();
  
  if (isLoading) {
    return <Loading message="Loading your golf performance data..." />;
  }

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">AI Analysis</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Personalized insights and recommendations based on your performance data
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
      
      {!analysis ? (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">No Analysis Yet</CardTitle>
            <CardDescription>
              Click "Update Analysis" to generate your first personalized golf performance analysis.
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
            <ConfidenceChart confidenceData={aiConfidenceHistory} currentConfidence={analysis.aiConfidence} />
            <IdentifiedIssues issues={analysis.identifiedIssues} />
          </div>
          
          <PracticeRecommendations recommendations={analysis.recommendedPractice} />
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
