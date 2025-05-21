
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useCreateRound = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createRound = async (courseId: string, teeId: string | null, holeCount: number = 18) => {
    try {
      setIsCreating(true);
      
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to track rounds",
          variant: "destructive",
        });
        return null;
      }
      
      console.log(`Creating round with ${holeCount} holes`);
      
      // Create the round in the database
      const { data, error } = await supabase
        .from("rounds")
        .insert({
          user_id: user.id,
          course_id: courseId,
          tee_id: teeId,
          hole_count: holeCount, // Make sure holeCount is passed through here
          date: new Date().toISOString().split('T')[0], // Current date formatted as YYYY-MM-DD
        })
        .select("id")
        .single();
      
      if (error) {
        console.error("Error creating round:", error);
        toast({
          title: "Error Creating Round",
          description: "Could not create a new round. Please try again.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Round created with ID:", data.id);
      
      return data.id;
    } catch (error) {
      console.error("Error in create round function:", error);
      toast({
        title: "Error",
        description: "Something went wrong while creating the round",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createRound, isCreating };
};
