
import { useState } from 'react';
import { AIAnalysisForPracticePlan } from "@/types/practice-plan";
import { useAIConfidence } from './useAIConfidence';
import { usePracticePlanGeneration } from './usePracticePlanGeneration';
import { useAuth } from "@/context/AuthContext";

export const useAIAnalysis = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AIAnalysisForPracticePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { aiConfidenceHistory, updateConfidence } = useAIConfidence();
  const { generatePlan, isGenerating } = usePracticePlanGeneration();

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      // Mock data for analysis - in a real app, this would call the backend
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
      updateConfidence(mockAnalysis.aiConfidence);
      
    } catch (error) {
      console.error('Error generating analysis:', error);
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
