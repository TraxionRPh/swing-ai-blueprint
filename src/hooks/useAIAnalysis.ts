
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { AIAnalysisForPracticePlan } from "@/types/practice-plan";
import { ConfidencePoint } from "@/types/drill";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useAIAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<AIAnalysisForPracticePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiConfidenceHistory, setAiConfidenceHistory] = useState<ConfidencePoint[]>([
    { date: '3 weeks ago', confidence: 65 },
    { date: '2 weeks ago', confidence: 72 },
    { date: 'Last week', confidence: 83 },
    { date: 'This week', confidence: 90 }
  ]);

  const checkAPIUsage = async () => {
    if (!user) {
      toast({
        title: "Not Authorized",
        description: "Please log in to use AI features.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-api-usage', {
        body: { 
          user_id: user.id, 
          type: 'ai_analysis' 
        }
      });

      if (error) {
        toast({
          title: "API Limit Reached",
          description: "You've reached your daily limit of 5 AI-powered analyses.",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error('API usage check failed:', err);
      toast({
        title: "Error",
        description: "Failed to check API usage. Please try again later.",
        variant: "destructive"
      });
      return false;
    }
  };

  const generateAnalysis = async () => {
    setIsGenerating(true);
    
    // First check API usage
    const canProceed = await checkAPIUsage();
    if (!canProceed) {
      setIsGenerating(false);
      return;
    }
    
    try {
      // Mock data - in a real app, this would call the backend
      const mockAnalysis: AIAnalysisForPracticePlan = {
        performanceAnalysis: {
          driving: Math.floor(Math.random() * 100),
          ironPlay: Math.floor(Math.random() * 100),
          chipping: Math.floor(Math.random() * 100),
          bunker: Math.floor(Math.random() * 100),
          putting: Math.floor(Math.random() * 100)
        },
        aiConfidence: Math.floor(70 + Math.random() * 30),
        identifiedIssues: [
          {
            area: 'Driving',
            description: 'Inconsistent ball striking with driver',
            priority: 'High'
          },
          {
            area: 'Putting',
            description: 'Poor distance control on long putts',
            priority: 'Medium'
          }
        ],
        recommendedPractice: {
          weeklyFocus: 'Driving Accuracy',
          primaryDrill: {
            name: 'Tee Gate Drill',
            description: 'Practice hitting through two tees set up as a gate',
            frequency: '3x per week'
          },
          secondaryDrill: {
            name: 'Alignment Stick Path Drill',
            description: 'Use alignment sticks to practice proper swing path',
            frequency: '2x per week'
          },
          weeklyAssignment: 'Focus on maintaining proper setup and alignment before each drive'
        }
      };
      
      setAnalysis(mockAnalysis);
      
      // Update confidence history
      setAiConfidenceHistory(prev => {
        const newHistory = [...prev];
        if (newHistory.length >= 10) {
          newHistory.shift(); // Remove oldest entry if we have 10 already
        }
        newHistory.push({ 
          date: 'Today', 
          confidence: mockAnalysis.aiConfidence 
        });
        return newHistory;
      });
      
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePracticePlan = async (issue: string): Promise<GeneratedPracticePlan> => {
    // First check API usage
    const canProceed = await checkAPIUsage();
    if (!canProceed) {
      throw new Error('Daily API limit reached');
    }

    const { data, error } = await supabase.functions.invoke('search-drills', {
      body: { query: issue }
    });

    if (error) throw error;

    // Construct a practice plan
    return {
      problem: issue,
      diagnosis: "AI analysis of your golf issue",
      rootCauses: ["Technique", "Equipment"],
      recommendedDrills: data.drills.map(drill => ({
        name: drill.title,
        description: drill.overview,
        difficulty: drill.difficulty,
        duration: drill.duration,
        focus: drill.focus
      })),
      practicePlan: {
        duration: "4 weeks",
        frequency: "3 times per week",
        sessions: [{
          focus: "Improving Technique",
          drills: data.drills.map(drill => drill.title),
          duration: "1 hour"
        }]
      }
    };
  };

  return { 
    generatePracticePlan,
    analysis,
    isLoading,
    isGenerating,
    generateAnalysis,
    aiConfidenceHistory
  };
};
