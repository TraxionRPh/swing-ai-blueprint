
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

export const useProfile = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Check profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('has_onboarded')
          .eq('id', user.id)
          .single();

        if (profileError || !profileData) {
          setIsFirstVisit(true);
        } else {
          setIsFirstVisit(profileData.has_onboarded === false);
        }

        // Check subscription status
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

  return { isFirstVisit, loading, isPremium };
};
