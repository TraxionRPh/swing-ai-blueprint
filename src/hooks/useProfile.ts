
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
    let mounted = true;
    
    const checkUserProfile = async () => {
      // If no user, reset states and return
      if (!user?.id) {
        if (mounted) {
          setLoading(false);
          setIsFirstVisit(null);
        }
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_onboarded, handicap_level, goals')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;

        // If no profile exists, create one
        if (!data) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: user.id });
            
          if (insertError) throw insertError;
          
          if (mounted) {
            setIsFirstVisit(true);
            setHandicap("beginner");
            setGoals("");
          }
        } else {
          if (mounted) {
            setIsFirstVisit(!data.has_onboarded);
            setHandicap(data.handicap_level as HandicapLevel || "beginner");
            setGoals(data.goals || "");
          }
        }
      } catch (error: any) {
        console.error('Error checking user profile:', error);
        toast({
          title: "Error checking profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    checkUserProfile();
    
    return () => {
      mounted = false;
    };
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
