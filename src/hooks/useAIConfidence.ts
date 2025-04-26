
import { useState } from 'react';
import { ConfidencePoint } from "@/types/drill";

export const useAIConfidence = () => {
  const [aiConfidenceHistory, setAiConfidenceHistory] = useState<ConfidencePoint[]>([
    { date: '3 weeks ago', confidence: 65 },
    { date: '2 weeks ago', confidence: 72 },
    { date: 'Last week', confidence: 83 },
    { date: 'This week', confidence: 90 }
  ]);

  const updateConfidence = (newConfidence: number) => {
    setAiConfidenceHistory(prev => {
      const newHistory = [...prev];
      if (newHistory.length >= 10) {
        newHistory.shift();
      }
      newHistory.push({ 
        date: 'Today', 
        confidence: newConfidence 
      });
      return newHistory;
    });
  };

  return { aiConfidenceHistory, updateConfidence };
};
