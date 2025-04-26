
import { useState, useEffect } from 'react';
import { ConfidencePoint } from "@/types/drill";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { differenceInWeeks, subWeeks } from 'date-fns';

export const useAIConfidence = () => {
  const { user } = useAuth();
  const [aiConfidenceHistory, setAiConfidenceHistory] = useState<ConfidencePoint[]>([]);

  useEffect(() => {
    const loadInitialConfidence = async () => {
      if (!user) return;

      try {
        // Get user's profile creation date
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .single();

        if (!profile) return;

        const userStartDate = new Date(profile.created_at);
        const now = new Date();
        const weeksActive = Math.min(4, differenceInWeeks(now, userStartDate));

        // Generate confidence points only for weeks since user joined
        const initialPoints: ConfidencePoint[] = [];
        for (let i = weeksActive; i > 0; i--) {
          initialPoints.push({
            date: `${i} week${i > 1 ? 's' : ''} ago`,
            confidence: 35 + (i * 10) // Simple progression for initial data
          });
        }

        setAiConfidenceHistory(initialPoints);
      } catch (error) {
        console.error("Error loading confidence history:", error);
      }
    };

    loadInitialConfidence();
  }, [user]);

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
