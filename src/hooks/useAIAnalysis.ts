import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

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
      return data?.practice_plan as AIAnalysisData | null;
    },
    enabled: !!user?.id,
  });

  // Generate new AI analysis
  const { mutate: generateAnalysis, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User is not authenticated');
      }

      const response = await supabase.functions.invoke('analyze-golf-performance', {
        body: {
          userId: user.id,
          roundData: rounds,
          handicapLevel: handicap,
          goals: goals
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

  return {
    analysis,
    isLoading: isLoadingRounds || isLoadingAnalysis,
    isGenerating,
    generateAnalysis,
    aiConfidenceHistory,
    rounds
  };
};
