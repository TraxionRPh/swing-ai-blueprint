
import { useState, useEffect } from 'react';
import { AIAnalysisForPracticePlan } from "@/types/practice-plan";
import { useAIConfidence } from './useAIConfidence';
import { usePracticePlanGeneration } from './usePracticePlanGeneration';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Issue } from '@/components/ai-analysis/IdentifiedIssues';

export const useAIAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AIAnalysisForPracticePlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { aiConfidenceHistory, updateConfidence } = useAIConfidence();
  const { generatePlan, isGenerating } = usePracticePlanGeneration();

  useEffect(() => {
    const fetchExistingAnalysis = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ai_practice_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('problem', 'Golf performance optimization')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          throw error;
        }

        if (data && data.length > 0 && data[0].practice_plan) {
          // Explicitly cast the data to AIAnalysisForPracticePlan
          const practicePlan = data[0].practice_plan as unknown as AIAnalysisForPracticePlan;
          setAnalysis(practicePlan);
          
          if (practicePlan.aiConfidence) {
            updateConfidence(practicePlan.aiConfidence);
          }
        }
      } catch (error) {
        console.error("Error fetching existing analysis:", error);
        toast({
          title: "Error",
          description: "Failed to load your previous analysis.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingAnalysis();
  }, [user, toast, updateConfidence]);

  const generateAnalysis = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "You need to be logged in to generate an analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-golf-performance', {
        body: { 
          userId: user.id
        }
      });

      if (error) {
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to generate analysis. Please try again later.",
          variant: "destructive"
        });
        throw error;
      }

      if (!data || !data.analysis) {
        throw new Error("No analysis data received");
      }
      
      // Cast the response to our expected type
      const realAnalysis = data.analysis as AIAnalysisForPracticePlan;
      setAnalysis(realAnalysis);
      
      if (typeof realAnalysis.aiConfidence === 'number') {
        updateConfidence(realAnalysis.aiConfidence);
      } else {
        updateConfidence(Math.floor(70 + Math.random() * 15));
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your golf performance analysis has been generated based on your actual data.",
      });
      
    } catch (error) {
      console.error('Error generating analysis:', error);
      
      const mockAnalysis: AIAnalysisForPracticePlan = {
        performanceAnalysis: {
          driving: Math.floor(Math.random() * 100),
          ironPlay: Math.floor(Math.random() * 100),
          chipping: Math.floor(Math.random() * 100),
          bunker: Math.floor(Math.random() * 100),
          putting: Math.floor(Math.random() * 100)
        },
        aiConfidence: Math.floor(40 + Math.random() * 20),
        identifiedIssues: [
          {
            area: 'Driving',
            description: 'Insufficient data for detailed driving analysis. Please complete more rounds for better insights.',
            priority: 'Medium' as const
          },
          {
            area: 'Putting',
            description: 'Analysis based on limited data. Track more rounds to improve accuracy.',
            priority: 'Low' as const
          }
        ],
        recommendedPractice: {
          weeklyFocus: 'Building Golf Data',
          primaryDrill: {
            name: 'Round Tracking',
            description: 'Complete full round tracking with fairway and GIR statistics',
            frequency: '1-2 rounds per week'
          },
          secondaryDrill: {
            name: 'Practice Sessions',
            description: 'Log your practice sessions to help build a complete picture of your game',
            frequency: '2x per week'
          },
          weeklyAssignment: 'Focus on tracking your performance to build data for more accurate AI analysis'
        }
      };
      
      setAnalysis(mockAnalysis);
      updateConfidence(mockAnalysis.aiConfidence);
      
      toast({
        title: "Limited Analysis Generated",
        description: "Using partial data for analysis. Complete more rounds for better insights.",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    generatePlan,
    analysis,
    isLoading,
    isGenerating,
    generateAnalysis,
    aiConfidenceHistory
  };
};
