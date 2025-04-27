
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { AnalyzeRequest } from "./types.ts";
import { PlanGenerator } from "./planGenerator.ts";
import { ResponseHandler } from "./responseHandler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize the Supabase client with the service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { 
      userId, 
      roundData = [], 
      handicapLevel,
      specificProblem = "Improve overall golf performance",
      planDuration = "1",
      availableDrills = []
    }: AnalyzeRequest = await req.json();

    console.log("Processing request with params:", {
      userId,
      handicapLevel,
      specificProblem,
      planDuration,
      availableDrillsCount: availableDrills?.length || 0
    });

    // Fetch available challenges with better logging
    const { data: challenges, error } = await supabaseAdmin
      .from('challenges')
      .select('*');

    if (error) {
      console.error("Error fetching challenges:", error);
      return ResponseHandler.createErrorResponse(new Error(`Failed to fetch challenges: ${error.message}`));
    }
    
    if (!challenges || challenges.length === 0) {
      console.warn("No challenges found in database. Creating default challenge.");
      
      // Create a default challenge when none exist
      const defaultChallenge = {
        id: "default-challenge-1",
        title: "Fairway Accuracy Challenge",
        description: "Test your ability to hit fairways consistently with your driver",
        difficulty: "Medium",
        category: "Driving",
        metrics: ["Fairways Hit"],
        metric: "Fairways Hit",
        instruction1: "Hit 10 drives aiming for the fairway",
        instruction2: "Count how many land in the fairway",
        instruction3: "Calculate your fairway hit percentage",
        attempts: 10
      };
      
      // Create plan generator with default challenge
      const planGenerator = new PlanGenerator(
        roundData,
        specificProblem,
        planDuration,
        availableDrills
      );
      
      // Generate the practice plan with default challenge
      const response = await planGenerator.generatePlan([defaultChallenge]);
      
      console.log("Plan generation complete with default challenge");
      console.log("Challenge assigned:", response.practicePlan.challenge?.title || "None");

      return ResponseHandler.createSuccessResponse(
        response,
        availableDrills,
        planDuration
      );
    }
    
    console.log(`Retrieved ${challenges.length} challenges from database`);

    // Create plan generator instance
    const planGenerator = new PlanGenerator(
      roundData,
      specificProblem,
      planDuration,
      availableDrills
    );
    
    // Generate the practice plan
    const response = await planGenerator.generatePlan(challenges);

    console.log("Plan generation complete with diagnosis length:", response.diagnosis.length);
    console.log("Challenge assigned:", response.practicePlan.challenge?.title || "None");

    return ResponseHandler.createSuccessResponse(
      response,
      availableDrills,
      planDuration
    );
  } catch (error) {
    console.error('Error:', error);
    return ResponseHandler.createErrorResponse(error);
  }
});
