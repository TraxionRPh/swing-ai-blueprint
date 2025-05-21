
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useCreateRound = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  // Create a new round
  const createRound = async (courseId: string, teeId: string | null, holeCount: number) => {
    if (!user) {
      console.error("Cannot create round: No authenticated user");
      throw new Error("Authentication required");
    }
    
    if (!courseId) {
      console.error("Cannot create round: No course ID provided");
      throw new Error("Course selection required");
    }
    
    try {
      console.log(`Creating round for course ${courseId} with tee ${teeId || 'none'} and ${holeCount} holes`);
      setSaveInProgress(true);
      
      // Create the new round using an optimized query
      const { data, error } = await supabase
        .from('rounds')
        .insert({
          user_id: user.id,
          course_id: courseId,
          tee_id: teeId,
          hole_count: holeCount,
          date: new Date().toISOString().split('T')[0]
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Database error creating round:", error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (data && data.id) {
        console.log(`Successfully created round with ID: ${data.id}`);
        
        // Save the new round ID to storage for persistence
        try {
          sessionStorage.setItem('current-round-id', data.id);
          localStorage.setItem('current-round-id', data.id);
          
          // Set the current hole number to 1 for a new round
          sessionStorage.setItem('current-hole-number', '1');
        } catch (storageError) {
          console.error('Failed to save round ID to storage:', storageError);
          // Continue anyway - this is non-critical
        }
        
        return data.id;
      } else {
        console.error("No round ID returned from database");
        throw new Error("Failed to create round");
      }
    } catch (error) {
      console.error("Error creating round:", error);
      throw error; // Re-throw for proper error handling upstream
    } finally {
      setSaveInProgress(false);
    }
  };

  return {
    createRound,
    saveInProgress
  };
};
