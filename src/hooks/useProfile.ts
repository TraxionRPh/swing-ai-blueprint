
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type HandicapLevel = "beginner" | "novice" | "intermediate" | "advanced" | "expert" | "pro";

interface UseProfileReturn {
  isFirstVisit: boolean | null;
  handicap: HandicapLevel;
  goals: string;
  setHandicap: (value: HandicapLevel) => void;
  setGoals: (value: string) => void;
  saveProfile: () => Promise<void>;
  loading: boolean;
}

export const useProfile = (): UseProfileReturn => {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);
  const [handicap, setHandicap] = useState<HandicapLevel>("beginner");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;
    
    const checkUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_onboarded')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;

        // If no profile exists, create one
        if (!data) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id });
            
          if (insertError) throw insertError;
          setIsFirstVisit(true);
        } else {
          setIsFirstVisit(!data.has_onboarded);
        }
      } catch (error: any) {
        console.error('Error checking user profile:', error);
        toast({
          title: "Error checking profile",
          description: error.message,
          variant: "destructive",
        });
        setIsFirstVisit(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserProfile();
  }, [user?.id, toast]);

  const saveProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          handicap_level: handicap,
          goals: goals,
          has_onboarded: true
        });
        
      if (error) throw error;
      
      toast({
        title: "Profile set up successfully!",
        description: "Your personalized golf training experience is ready.",
      });
      
      setIsFirstVisit(false);
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    isFirstVisit,
    handicap,
    goals,
    setHandicap,
    setGoals,
    saveProfile,
    loading
  };
};
