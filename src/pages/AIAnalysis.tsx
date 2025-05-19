
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

  if (isGenerating) {
    return (
      <Loading 
        message="AI is analyzing your performance data..." 
        className="min-h-[80vh] flex flex-col items-center justify-center" 
        fixed={true}
      />
    );
  }

  // Get performance data from analysis
  const performanceData = analysisData?.practice_plan?.performanceInsights?.performance;
  
  // Get confidence data
  const confidenceData = [
    { date: "Last Week", confidence: 75 },
    { date: "Today", confidence: 85 }
  ];
  
  // Get current confidence
  const currentConfidence = confidenceData[confidenceData.length - 1].confidence;
  
  // Map raw root causes to more generalized issue format if they exist
  const mappedIssues = analysisData?.rootCauses?.map((cause: string, i: number) => {
    // Transform the raw cause descriptions into more generalized issues
    let area, description;
    
    // Map cause to general area based on keywords
    if (cause.toLowerCase().includes('driv') || cause.toLowerCase().includes('tee shot')) {
      area = "Driving Accuracy";
      description = "Your driving performance shows opportunities for improvement in accuracy and consistency.";
    } else if (cause.toLowerCase().includes('putt')) {
      area = "Putting";
      description = "Your putting statistics indicate room for improvement in both speed and direction control.";
    } else if (cause.toLowerCase().includes('iron') || cause.toLowerCase().includes('approach')) {
      area = "Iron Play";
      description = "Your iron shots show patterns that could be improved with focused practice on contact and direction.";
    } else if (cause.toLowerCase().includes('bunker') || cause.toLowerCase().includes('sand')) {
      area = "Bunker Play";
      description = "Your bunker play metrics suggest an opportunity to improve your sand save percentage.";
    } else if (cause.toLowerCase().includes('short game') || cause.toLowerCase().includes('chip') || cause.toLowerCase().includes('pitch')) {
      area = "Short Game";
      description = "Your short game performance around the green indicates room for improvement in up-and-down situations.";
    } else {
      // Default fallback for unrecognized categories
      area = `Golf Skill ${i+1}`;
      description = cause.replace(/\b\d+%\b/g, ""); // Remove specific percentages
    }
  
    return {
      area,
      description,
      priority: i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low'
    };
  });
  
  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      <AIAnalysisHeader 
        isGenerating={isGenerating} 
        onRefresh={handleRefreshAnalysis}
        apiUsageInfo={apiUsageInfo}
      />
      <AIAnalysisInfoBanner />
      
      {analysisData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <PerformanceRadarChart data={performanceData} />
          <ConfidenceChart confidenceData={confidenceData} currentConfidence={currentConfidence} />
          <IdentifiedIssues issues={mappedIssues} />
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
    </div>
  );
};

export default AIAnalysis;
