
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Drill } from '@/types/drill';

export const usePracticeTracking = (drill: Drill) => {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Update elapsed time every second when tracking
  useEffect(() => {
    let intervalId: number;
    
    if (isTracking && startTime) {
      intervalId = window.setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTracking, startTime]);

  const startPractice = useCallback(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your practice time.",
        variant: "destructive"
      });
      return;
    }
    
    setIsTracking(true);
    setStartTime(new Date());
    setElapsedTime(0);
    
    toast({
      title: "Practice Started",
      description: `Started practicing ${drill.title}`,
    });
  }, [user, drill.title, toast]);

  const completePractice = useCallback(async () => {
    if (!user || !startTime || !isTracking) return;
    
    const endTime = new Date();
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    try {
      const { error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: user.id,
          focus_area: drill.category || 'general',
          duration_minutes: durationMinutes,
          date: new Date().toISOString().split('T')[0]
        });
      
      if (error) throw error;
      
      toast({
        title: "Practice Completed",
        description: `Recorded ${durationMinutes} minutes of practice`,
      });
    } catch (error) {
      console.error('Error saving practice session:', error);
      toast({
        title: "Error",
        description: "Failed to save practice session",
        variant: "destructive"
      });
    }
    
    setIsTracking(false);
    setStartTime(null);
    setElapsedTime(0);
  }, [user, startTime, isTracking, drill.category, toast]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isTracking,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    startPractice,
    completePractice
  };
};
