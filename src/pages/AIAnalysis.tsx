
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
import { useAIConfidence } from "@/hooks/useAIConfidence";
import { GeneratedPracticePlan } from "@/types/practice-plan";

const AIAnalysis = () => {
  const { generatePlan, isGenerating, apiUsageInfo } = useAIAnalysis();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const { aiConfidenceHistory, updateConfidence } = useAIConfidence();
  const [hasPerformanceData, setHasPerformanceData] = useState<boolean>(false);
  
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
          
          // Properly access performance data with type safety
          const practicePlan = planData[0].practice_plan;
          
          // Check if practicePlan is an object and has performanceInsights
          if (practicePlan && 
              typeof practicePlan === 'object' && 
              'performanceInsights' in practicePlan) {
            
            const performanceData = practicePlan.performanceInsights?.performance;
            const isPlaceholder = practicePlan.performanceInsights?.isPlaceholder;
            
            // We have real data if performance data exists and is not marked as placeholder
            setHasPerformanceData(!!performanceData && !isPlaceholder);
          } else {
            setHasPerformanceData(false);
          }
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
            
            // Properly access updated performance data
            const practicePlanData = data.practice_plan;
            
            if (practicePlanData && 
                typeof practicePlanData === 'object' && 
                'performanceInsights' in practicePlanData) {
              
              const performanceData = practicePlanData.performanceInsights?.performance;
              const isPlaceholder = practicePlanData.performanceInsights?.isPlaceholder;
              
              setHasPerformanceData(!!performanceData && !isPlaceholder);
            } else {
              setHasPerformanceData(false);
            }
          }
        })
        .catch(error => {
          console.error("Error refreshing analysis:", error);
        });
    } catch (error) {
      console.error("Error in refresh analysis handler:", error);
    }
  };

  // Calculate the current confidence level (most recent value)
  const currentConfidence = aiConfidenceHistory.length > 0 
    ? aiConfidenceHistory[aiConfidenceHistory.length - 1].confidence 
    : 35; // Default starting confidence for brand new users

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
              <PerformanceRadarChart 
                data={analysisData?.practice_plan?.performanceInsights?.performance}
                isPlaceholder={!hasPerformanceData} 
              />
              <ConfidenceChart 
                confidenceData={aiConfidenceHistory}
                currentConfidence={currentConfidence}
              />
              <IdentifiedIssues issues={
                // Use real issues from the API if available
                analysisData?.performanceInsights?.length > 0 ? 
                  analysisData.performanceInsights.map((insight: any) => ({
                    area: insight.area,
                    description: insight.description,
                    priority: insight.priority
                  })) :
                  // Fallback to root causes with default descriptions
                  analysisData?.rootCauses?.map((cause: string, i: number) => {
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
                  })
              } />
              <PracticeRecommendations 
                recommendations={
                  analysisData?.practice_plan?.plan?.[0] ? {
                    weeklyFocus: analysisData.practice_plan.plan[0].focus || "Swing Fundamentals",
                    primaryDrill: {
                      name: analysisData.practice_plan.plan[0].drills?.[0]?.drill?.title || "Alignment Drill",
                      description: analysisData.practice_plan.plan[0].drills?.[0]?.drill?.overview || "Basic alignment practice",
                      frequency: `${analysisData.practice_plan.plan[0].drills?.[0]?.sets || 3}x sets, ${analysisData.practice_plan.plan[0].drills?.[0]?.reps || 10}x reps`
                    },
                    secondaryDrill: {
                      name: analysisData.practice_plan.plan[0].drills?.[1]?.drill?.title || "Swing Path Drill",
                      description: analysisData.practice_plan.plan[0].drills?.[1]?.drill?.overview || "Practice your swing path",
                      frequency: `${analysisData.practice_plan.plan[0].drills?.[1]?.sets || 2}x sets, ${analysisData.practice_plan.plan[0].drills?.[1]?.reps || 10}x reps`
                    },
                    weeklyAssignment: analysisData.practice_plan.challenge?.description || "Complete a practice challenge this week"
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
