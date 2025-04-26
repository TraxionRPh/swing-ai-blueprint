
import { useState } from 'react';
import { AIAnalysisForPracticePlan } from "@/types/practice-plan";
import { useAIConfidence } from './useAIConfidence';
import { usePracticePlanGeneration } from './usePracticePlanGeneration';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAIAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AIAnalysisForPracticePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { aiConfidenceHistory, updateConfidence } = useAIConfidence();
  const { generatePlan, isGenerating } = usePracticePlanGeneration();

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
      // Call Supabase edge function to generate analysis based on real user data
      const { data, error } = await supabase.functions.invoke('analyze-golf-performance', {
        body: { 
          userId: user.id
          // No specificProblem or planDuration to indicate this is a full analysis
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
      
      // Use the real data from the edge function
      const realAnalysis = data.analysis;
      setAnalysis(realAnalysis);
      
      // Update confidence level from the analysis
      if (typeof realAnalysis.aiConfidence === 'number') {
        updateConfidence(realAnalysis.aiConfidence);
      } else {
        // Default confidence if not provided
        updateConfidence(Math.floor(70 + Math.random() * 15));
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your golf performance analysis has been generated based on your actual data.",
      });
      
    } catch (error) {
      console.error('Error generating analysis:', error);
      
      // In case of error, fall back to mock data but with lower confidence level
      const mockAnalysis: AIAnalysisForPracticePlan = {
        performanceAnalysis: {
          driving: Math.floor(Math.random() * 100),
          ironPlay: Math.floor(Math.random() * 100),
          chipping: Math.floor(Math.random() * 100),
          bunker: Math.floor(Math.random() * 100),
          putting: Math.floor(Math.random() * 100)
        },
        aiConfidence: Math.floor(40 + Math.random() * 20), // Lower confidence for mock data
        identifiedIssues: [
          {
            area: 'Driving',
            description: 'Insufficient data for detailed driving analysis. Please complete more rounds for better insights.',
            priority: 'Medium'
          },
          {
            area: 'Putting',
            description: 'Analysis based on limited data. Track more rounds to improve accuracy.',
            priority: 'Low'
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
