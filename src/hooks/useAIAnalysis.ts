import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GeneratedPracticePlan } from "@/types/practice-plan";
import { AIAnalysisForPracticePlan } from "@/types/practice-plan";
import { ConfidencePoint } from "@/types/drill";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { HandicapLevel } from "@/hooks/useProfile";

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

  const generatePracticePlan = async (
    issue: string, 
    handicapLevel?: HandicapLevel, 
    planDuration: string = "1"
  ): Promise<GeneratedPracticePlan> => {
    // First check API usage
    const canProceed = await checkAPIUsage();
    if (!canProceed) {
      throw new Error('Daily API limit reached');
    }

    try {
      // Get user round data if available
      const { data: roundData } = await supabase
        .from('rounds')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Call the analyze-golf-performance edge function with user data
      const { data, error } = await supabase.functions.invoke('analyze-golf-performance', {
        body: { 
          userId: user?.id, 
          roundData: roundData || [],
          handicapLevel: handicapLevel || 'intermediate',
          specificProblem: issue || 'Improve overall golf performance',
          planDuration
        }
      });

      if (error) throw error;

      // If this is a beginner with little data and no specific issue,
      // adjust the response to focus on fundamentals
      if (
        handicapLevel === 'beginner' && 
        (!roundData || roundData.length < 2) && 
        (!issue || issue.trim() === '')
      ) {
        // Add fundamentals focus
        if (data.practicePlan) {
          data.practicePlan.rootCauses = [
            ...(data.practicePlan.rootCauses || []),
            "Beginner fundamentals need development"
          ];
          
          if (data.practicePlan.sessions && data.practicePlan.sessions.length > 0) {
            data.practicePlan.sessions[0].focus = "Building Fundamentals";
          }
        }
      }

      // Check for specific problems and ensure drills match
      if (issue && issue.toLowerCase().includes("slice") && issue.toLowerCase().includes("driver")) {
        // Add a specific focus for slicing driver
        if (data.practicePlan) {
          data.practicePlan.problem = "Slicing Driver";
          data.practicePlan.diagnosis = "Analysis indicates an out-to-in swing path causing a slice with your driver";
        }
      }

      return data.practicePlan || {
        problem: issue || "Golf performance optimization",
        diagnosis: "AI analysis of your golf game",
        rootCauses: ["Technique", "Equipment"],
        recommendedDrills: [
          {
            name: "Alignment Drill",
            description: "Practice proper alignment with targets",
            difficulty: "Beginner",
            duration: "15 minutes",
            focus: ["Fundamentals", "Setup"]
          },
          {
            name: "Tempo Training",
            description: "Work on consistent tempo throughout the swing",
            difficulty: "Intermediate",
            duration: "20 minutes",
            focus: ["Swing", "Rhythm"]
          }
        ],
        practicePlan: {
          duration: `${planDuration} ${parseInt(planDuration) > 1 ? 'days' : 'day'}`,
          frequency: "Daily",
          sessions: [
            {
              focus: "Building Fundamentals",
              drills: ["Alignment Drill", "Tempo Training"],
              duration: "45 minutes"
            }
          ]
        }
      };
    } catch (error) {
      console.error("Error generating practice plan:", error);
      throw error;
    }
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
