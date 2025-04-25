import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

// Define the HandicapLevel type
export type HandicapLevel = "beginner" | "novice" | "intermediate" | "advanced" | "expert" | "pro";

export const useProfile = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  
  const [handicap, setHandicap] = useState<HandicapLevel | null>(null);
  const [goals, setGoals] = useState<string | null>(null);

  const saveProfile = async (profileData: { handicap?: HandicapLevel; goals?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          handicap_level: profileData.handicap,
          goals: profileData.goals,
          has_onboarded: true
        })
        .eq('id', user.id);

      if (error) throw error;
      
      if (profileData.handicap) setHandicap(profileData.handicap);
      if (profileData.goals) setGoals(profileData.goals);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const checkProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('has_onboarded, handicap_level, goals')
          .eq('id', user.id)
          .single();

        if (profileError || !profileData) {
          setIsFirstVisit(true);
        } else {
          setIsFirstVisit(profileData.has_onboarded === false);
          setHandicap(profileData.handicap_level);
          setGoals(profileData.goals);
        }

        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('is_premium')
          .eq('user_id', user.id)
          .single();

        if (!subscriptionError && subscriptionData) {
          setIsPremium(subscriptionData.is_premium);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, []);

  return { 
    isFirstVisit, 
    loading, 
    isPremium,
    handicap,
    goals,
    setHandicap,
    setGoals,
    saveProfile 
  };
};
