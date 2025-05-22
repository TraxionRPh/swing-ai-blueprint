
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

export const useRoundLimit = () => {
  const [canTrackRound, setCanTrackRound] = useState(true);
  const [daysUntilNextRound, setDaysUntilNextRound] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isPremium } = useProfile();
  const { toast } = useToast();

  // Function to check if user can track another round
  // Currently allowing all users to track rounds without limits
  const checkRoundLimit = useCallback(async () => {
    // Premium features are turned off, all users have full access
    setCanTrackRound(true);
    setDaysUntilNextRound(0);
    setIsLoading(false);
    return true;
  }, []);
  
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
