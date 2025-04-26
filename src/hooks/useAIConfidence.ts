
import { useState, useEffect } from 'react';
import { ConfidencePoint } from "@/types/drill";

export const useAIConfidence = () => {
  const [aiConfidenceHistory, setAiConfidenceHistory] = useState<ConfidencePoint[]>([
    { date: '4 weeks ago', confidence: 35 },
    { date: '3 weeks ago', confidence: 48 },
    { date: '2 weeks ago', confidence: 62 },
    { date: 'Last week', confidence: 71 }
  ]);

  const updateConfidence = (newConfidence: number) => {
    setAiConfidenceHistory(prev => {
      const newHistory = [...prev];
      if (newHistory.length >= 10) {
        newHistory.shift();
      }
      newHistory.push({ 
        date: 'This week', 
        confidence: newConfidence 
      });
      return newHistory;
    });
  };

  return { aiConfidenceHistory, updateConfidence };
};
