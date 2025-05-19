
import { useState, useEffect } from "react";
import { PerformanceRadarChart } from "@/components/ai-analysis/PerformanceRadarChart";
import { ConfidenceChart } from "@/components/ai-analysis/ConfidenceChart";
import { IdentifiedIssues } from "@/components/ai-analysis/IdentifiedIssues";
import { PracticeRecommendations } from "@/components/ai-analysis/PracticeRecommendations";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Loading } from "@/components/ui/loading";
import { AIAnalysisHeader } from "@/components/ai-analysis/AIAnalysisHeader";
import { AIAnalysisInfoBanner } from "@/components/ai-analysis/AIAnalysisInfoBanner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AIAnalysis = () => {
  const { generatePlan, isGenerating, apiUsageInfo } = useAIAnalysis();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  
  // Get current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setUserId(data.user.id);
      }
    };
    
    fetchUserId();
  }, []);
  
  const handleRefreshAnalysis = () => {
    try {
      generatePlan(userId, "", "beginner", "1")
        .catch(error => {
          console.error("Error refreshing analysis:", error);
          // Additional error is already shown by the toast in useAIAnalysis
        });
    } catch (error) {
      console.error("Error in refresh analysis handler:", error);
    }
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
