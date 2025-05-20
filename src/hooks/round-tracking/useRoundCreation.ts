
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to handle round creation functionality
 */
export const useRoundCreation = (user: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [createdRoundId, setCreatedRoundId] = useState<string | null>(null);
  const { toast } = useToast();

  const createNewRound = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your round",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log("Creating new round in database");
      setIsLoading(true);
      
      // Get course ID from session storage
      const actualCourseId = sessionStorage.getItem('current-course-id');
      const actualTeeId = sessionStorage.getItem('current-tee-id');
      
      if (!actualCourseId) {
        toast({
          title: "Course Selection Required",
          description: "Please select a course before saving your round",
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }
      
      // Get hole count from session storage
      const storedHoleCount = sessionStorage.getItem('current-hole-count');
      const roundHoleCount = storedHoleCount ? parseInt(storedHoleCount) : 18;
      
      console.log(`Creating a ${roundHoleCount}-hole round for course: ${actualCourseId}`);
      
      // Create the round in the database
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          user_id: user.id,
          course_id: actualCourseId,
          tee_id: actualTeeId || null,
          hole_count: roundHoleCount,
          date: new Date().toISOString().split('T')[0]
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Error creating round:', error);
        toast({
          title: "Error Creating Round",
          description: "Could not create a new round in the database. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }
      
      console.log(`Created new ${roundHoleCount}-hole round with ID:`, data.id);
      setCreatedRoundId(data.id);
      
      // Ensure hole count is persisted in session storage
      sessionStorage.setItem('current-hole-count', roundHoleCount.toString());
      
      setIsLoading(false);
      return data.id;
    } catch (error) {
      console.error("Error in createNewRound:", error);
      toast({
        title: "Error Creating Round",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return null;
    }
  };

  return {
    isLoading,
    setIsLoading,
    createdRoundId,
    setCreatedRoundId,
    createNewRound
  };
};
