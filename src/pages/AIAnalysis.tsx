
import { useState } from "react";
import { PerformanceRadarChart } from "@/components/ai-analysis/PerformanceRadarChart";
import { ConfidenceChart } from "@/components/ai-analysis/ConfidenceChart";
import { IdentifiedIssues } from "@/components/ai-analysis/IdentifiedIssues";
import { PracticeRecommendations } from "@/components/ai-analysis/PracticeRecommendations";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Loading } from "@/components/ui/loading";
import { AIAnalysisHeader } from "@/components/ai-analysis/AIAnalysisHeader";
import { AIAnalysisInfoBanner } from "@/components/ai-analysis/AIAnalysisInfoBanner";

const AIAnalysis = () => {
  const { generatePlan, isGenerating, apiUsageInfo } = useAIAnalysis();
  
  const handleRefreshAnalysis = () => {
    generatePlan(undefined, "", "beginner", "1");
  };

  if (isGenerating) {
    return (
      <Loading 
        message="AI is analyzing your performance data..." 
        className="min-h-[80vh] flex flex-col items-center justify-center" 
        fixed={true}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <AIAnalysisHeader 
        isGenerating={isGenerating} 
        onRefresh={handleRefreshAnalysis}
        apiUsageInfo={apiUsageInfo}
      />
      <AIAnalysisInfoBanner />
    </div>
  );
};

export default AIAnalysis;
