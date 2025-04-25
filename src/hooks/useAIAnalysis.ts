import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { GeneratedPracticePlan } from '@/types/practice-plan';

export interface AIAnalysisData {
  performanceAnalysis: {
    driving: number;
    ironPlay: number;
    chipping: number;
    bunker: number;
    putting: number;
  };
  aiConfidence: number;
  identifiedIssues: Array<{
    area: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
  recommendedPractice: {
    weeklyFocus: string;
    primaryDrill: {
      name: string;
      description: string;
      frequency: string;
    };
    secondaryDrill: {
      name: string;
      description: string;
      frequency: string;
    };
    weeklyAssignment: string;
  };
}

export const useAIAnalysis = () => {
  const [aiConfidenceHistory, setAiConfidenceHistory] = useState([
    { month: 'Jan', confidence: 65 },
    { month: 'Feb', confidence: 72 },
    { month: 'Mar', confidence: 78 },
    { month: 'Apr', confidence: 85 },
  ]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { handicap, goals } = useProfile();

  // Fetch latest rounds data
  const { data: rounds, isLoading: isLoadingRounds } = useQuery({
    queryKey: ['rounds'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('rounds')
        .select('*, hole_scores(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch the latest AI analysis
  const { data: analysis, isLoading: isLoadingAnalysis, refetch } = useQuery({
    queryKey: ['ai_analysis'],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('ai_practice_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is for "no rows returned"
      return data?.practice_plan as unknown as AIAnalysisData | null;
    },
    enabled: !!user?.id,
  });

  // Generate new AI analysis
  const { mutate: generateAnalysis, isPending: isGenerating } = useMutation({
    mutationFn: async (specificProblem?: string) => {
      if (!user?.id) {
        throw new Error('User is not authenticated');
      }

      const response = await supabase.functions.invoke('analyze-golf-performance', {
        body: {
          userId: user.id,
          roundData: rounds,
          handicapLevel: handicap,
          goals: goals,
          specificProblem: specificProblem
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate analysis');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Your personalized golf analysis has been updated.",
      });
      
      // Update confidence history with the new point
      if (data.analysis?.aiConfidence) {
        const date = new Date();
        const monthName = date.toLocaleString('default', { month: 'short' });
        
        setAiConfidenceHistory(prev => {
          // Check if we already have an entry for this month
          const existingIndex = prev.findIndex(item => item.month === monthName);
          if (existingIndex >= 0) {
            const newHistory = [...prev];
            newHistory[existingIndex] = { month: monthName, confidence: data.analysis.aiConfidence };
            return newHistory;
          } else {
            // Add new month to history, keeping only the last 12 months
            const newHistory = [...prev, { month: monthName, confidence: data.analysis.aiConfidence }];
            return newHistory.slice(-12); // Keep only last 12 months
          }
        });
      }
      
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Something went wrong while analyzing your golf data.",
        variant: "destructive",
      });
    }
  });

  // Fetch the latest practice plan
  const { data: latestPracticePlan, isLoading: isLoadingPracticePlan, refetch: refetchPracticePlan } = useQuery({
    queryKey: ['latest_practice_plan'],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('ai_practice_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is for "no rows returned"
      
      if (data && data.practice_plan && 'problem' in data.practice_plan) {
        // This is a practice plan
        return data.practice_plan as unknown as GeneratedPracticePlan;
      }
      
      return null;
    },
    enabled: !!user?.id,
  });
  
  // Generate new practice plan
  const { mutate: generatePracticePlan, isPending: isGeneratingPlan } = useMutation({
    mutationFn: async (problem: string) => {
      if (!user?.id) {
        throw new Error('User is not authenticated');
      }

      const response = await supabase.functions.invoke('analyze-golf-performance', {
        body: {
          userId: user.id,
          roundData: rounds,
          handicapLevel: handicap,
          goals: goals,
          specificProblem: problem
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate practice plan');
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Practice Plan Generated",
        description: "Your personalized practice plan is ready!",
      });
      
      refetchPracticePlan();
    },
    onError: (error) => {
      toast({
        title: "Plan Generation Failed",
        description: error.message || "Something went wrong while creating your practice plan.",
        variant: "destructive",
      });
    }
  });

  return {
    analysis,
    latestPracticePlan,
    isLoading: isLoadingRounds || isLoadingAnalysis,
    isLoadingPracticePlan,
    isGenerating,
    isGeneratingPlan,
    generateAnalysis,
    generatePracticePlan,
    aiConfidenceHistory,
    rounds
  };
};
