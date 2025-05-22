
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

export const useRoundLimit = () => {
  const [canTrackRound, setCanTrackRound] = useState(true);
  const [daysUntilNextRound, setDaysUntilNextRound] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isPremium } = useProfile();
  const { toast } = useToast();

  // Function to check if user can track another round
  const checkRoundLimit = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Premium users have unlimited rounds
      if (isPremium) {
        setCanTrackRound(true);
        setDaysUntilNextRound(0);
        setIsLoading(false);
        return true;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCanTrackRound(false);
        setIsLoading(false);
        return false;
      }
      
      // Check most recent round in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentRounds, error } = await supabase
        .from('rounds')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      // If no rounds in the last 7 days, user can track a new round
      if (!recentRounds || recentRounds.length === 0) {
        setCanTrackRound(true);
        setDaysUntilNextRound(0);
        setIsLoading(false);
        return true;
      }
      
      // Calculate days until next available round
      const lastRoundDate = new Date(recentRounds[0].date);
      const nextAvailableDate = new Date(lastRoundDate);
      nextAvailableDate.setDate(nextAvailableDate.getDate() + 7);
      
      const today = new Date();
      const diffTime = nextAvailableDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysUntilNextRound(Math.max(0, diffDays));
      setCanTrackRound(diffDays <= 0);
      
      return diffDays <= 0;
    } catch (error) {
      console.error("Error checking round limit:", error);
      // Default to allowing the user to track a round if there's an error
      setCanTrackRound(true);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [isPremium]);
  
  // Initialize on component mount
  useEffect(() => {
    checkRoundLimit();
  }, [checkRoundLimit]);
  
  return {
    canTrackRound,
    daysUntilNextRound,
    isLoading,
    checkRoundLimit
  };
};
