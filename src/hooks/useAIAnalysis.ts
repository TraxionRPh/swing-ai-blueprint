
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { GeneratedPracticePlan } from "@/types/practice-plan";

export const useAIAnalysis = () => {
  const generatePracticePlan = async (issue: string): Promise<GeneratedPracticePlan> => {
    const { data, error } = await supabase.functions.invoke('search-drills', {
      body: { query: issue }
    });

    if (error) throw error;

    // Construct a mock practice plan for now
    return {
      problem: issue,
      diagnosis: "AI analysis of your golf issue",
      rootCauses: ["Technique", "Equipment"],
      recommendedDrills: data.drills.map(drill => ({
        name: drill.title,
        description: drill.overview,
        difficulty: drill.difficulty,
        duration: drill.duration,
        focus: drill.focus
      })),
      practicePlan: {
        duration: "4 weeks",
        frequency: "3 times per week",
        sessions: [{
          focus: "Improving Technique",
          drills: data.drills.map(drill => drill.title),
          duration: "1 hour"
        }]
      }
    };
  };

  return { generatePracticePlan };
};
