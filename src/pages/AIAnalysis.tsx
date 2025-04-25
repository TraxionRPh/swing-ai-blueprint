
import { PerformanceRadarChart } from "@/components/ai-analysis/PerformanceRadarChart";
import { ConfidenceChart } from "@/components/ai-analysis/ConfidenceChart";
import { IdentifiedIssues } from "@/components/ai-analysis/IdentifiedIssues";
import { PracticeRecommendations } from "@/components/ai-analysis/PracticeRecommendations";

const AIAnalysis = () => {
  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Analysis</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Personalized insights and recommendations based on your performance data
        </p>
      </div>
      
      <div className="grid gap-4">
        <PerformanceRadarChart />
        
        <div className="grid gap-4 md:grid-cols-2">
          <ConfidenceChart />
          <IdentifiedIssues />
        </div>
        
        <PracticeRecommendations />
      </div>
    </div>
  );
};

export default AIAnalysis;
