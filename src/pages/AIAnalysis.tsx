
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
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  // Get current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setUserId(data.user.id);
        
        // Fetch the latest AI practice plan for this user
        const { data: planData } = await supabase
          .from('ai_practice_plans')
          .select('*')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (planData && planData.length > 0) {
          setAnalysisData(planData[0]);
        }
      }
    };
    
    fetchUserId();
  }, []);
  
  const handleRefreshAnalysis = () => {
    try {
      generatePlan(userId, "", "beginner", "1")
        .then((data) => {
          if (data) {
            setAnalysisData(data);
          }
        })
        .catch(error => {
          console.error("Error refreshing analysis:", error);
          // Additional error is already shown by the toast in useAIAnalysis
        });
    } catch (error) {
      console.error("Error in refresh analysis handler:", error);
    }
  };

  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <AIAnalysisHeader 
        isGenerating={isGenerating} 
        onRefresh={handleRefreshAnalysis}
        apiUsageInfo={apiUsageInfo}
      />
      <AIAnalysisInfoBanner />
      
      {isGenerating ? (
        <Loading 
          message="AI is analyzing your performance data..." 
          className="min-h-[80vh] flex flex-col items-center justify-center" 
          fixed={true}
        />
      ) : (
        <>
          {analysisData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <PerformanceRadarChart data={analysisData?.practice_plan?.performanceInsights?.performance} />
              <ConfidenceChart 
                confidenceData={[
                  { date: "Last Week", confidence: 75 },
                  { date: "Today", confidence: 85 }
                ]} 
                currentConfidence={85}
              />
              <IdentifiedIssues issues={analysisData?.rootCauses?.map((cause: string, i: number) => {
                let area, description;
                
                if (i === 0) {
                  area = "Driving Accuracy";
                  description = "Improving your accuracy off the tee will set you up for more successful approach shots and lower scores overall.";
                } else if (i === 1) {
                  area = "Short Game";
                  description = "Focus on your short game around the greens, especially chipping and bunker play. Consistent up-and-downs can significantly lower your scores.";
                } else if (i === 2) {
                  area = "Iron Play";
                  description = "Work on consistent distance control with your irons to improve your approach shots and increase greens in regulation.";
                } else if (i === 3) {
                  area = "Putting";
                  description = "Enhancing your putting skills, particularly with speed control and reading greens, can eliminate unnecessary strokes from your game.";
                } else {
                  area = "Course Management";
                  description = "Developing better strategic decisions on the course can help you avoid trouble and play to your strengths.";
                }
              
                return {
                  area,
                  description,
                  priority: i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low'
                };
              })} />
              <PracticeRecommendations 
                recommendations={
                  analysisData?.practicePlan?.plan?.[0] ? {
                    weeklyFocus: analysisData.practicePlan.plan[0].focus || "Swing Fundamentals",
                    primaryDrill: {
                      name: analysisData.practicePlan.plan[0].drills?.[0]?.drill?.title || "Alignment Drill",
                      description: analysisData.practicePlan.plan[0].drills?.[0]?.drill?.overview || "Basic alignment practice",
                      frequency: `${analysisData.practicePlan.plan[0].drills?.[0]?.sets || 3}x sets, ${analysisData.practicePlan.plan[0].drills?.[0]?.reps || 10}x reps`
                    },
                    secondaryDrill: {
                      name: analysisData.practicePlan.plan[0].drills?.[1]?.drill?.title || "Swing Path Drill",
                      description: analysisData.practicePlan.plan[0].drills?.[1]?.drill?.overview || "Practice your swing path",
                      frequency: `${analysisData.practicePlan.plan[0].drills?.[1]?.sets || 2}x sets, ${analysisData.practicePlan.plan[0].drills?.[1]?.reps || 10}x reps`
                    },
                    weeklyAssignment: analysisData.practicePlan.challenge?.description || "Complete a practice challenge this week"
                  } : undefined
                }
              />
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">No analysis data yet. Click "Update Analysis" to generate your first AI analysis.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIAnalysis;
