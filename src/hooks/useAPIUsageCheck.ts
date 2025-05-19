
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAPIUsageCheck = () => {
  const { toast } = useToast();

  const checkAPIUsage = useCallback(async (userId: string | undefined, type: 'ai_analysis' | 'practice_plan' = 'ai_analysis') => {
    if (!userId) {
      toast({
        title: "Not Authorized",
        description: "Please log in to use AI features.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-api-usage', {
        body: { 
          user_id: userId, 
          type 
        }
      });

      if (error) {
        console.error('API usage check failed:', error);
        toast({
          title: "Service Unavailable",
          description: "Unable to check API usage. Please try again later.",
          variant: "destructive"
        });
        return false;
      }

      // Check if limit reached
      if (data && data.limitReached) {
        toast({
          title: "API Limit Reached",
          description: data.message || "You've reached your daily limit of AI-powered analyses. Upgrade to premium for unlimited access.",
          variant: "destructive"
        });
        return false;
      }

      // Successful check with no limit reached
      return true;
    } catch (err) {
      console.error('API usage check failed:', err);
      toast({
        title: "Error",
        description: "Failed to check API usage. Please try again later.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return { checkAPIUsage };
};
