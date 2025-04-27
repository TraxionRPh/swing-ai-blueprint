
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { AnalyzeRequest } from "./types.ts";
import { PlanGenerator } from "./planGenerator.ts";
import { ResponseHandler } from "./responseHandler.ts";
import { identifyProblemCategory } from "./golfCategorization.ts";

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

    // Validate the input data
    if (!Array.isArray(availableDrills)) {
      console.warn("availableDrills is not an array, defaulting to empty array");
      availableDrills = [];
    }

    // Determine if this is an AI-generated plan (no specific problem) or user-specified problem
    const isAIGenerated = !specificProblem || specificProblem === "Improve overall golf performance";

    // Identify the problem category for better logging and matching
    const problemCategory = identifyProblemCategory(specificProblem);
    const categoryName = problemCategory?.name || 'General';

    console.log("Processing request with params:", {
      userId,
      handicapLevel,
      specificProblem,
      problemCategory: categoryName,
      planDuration,
      availableDrillsCount: availableDrills?.length || 0,
      isPuttingProblem: specificProblem.toLowerCase().includes('putt')
    });

    // Fetch additional user profile data if userId provided
    let userData = null;
    if (userId) {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('handicap_level, selected_goals, score_goal, handicap_goal, has_onboarded')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.warn("Error fetching user profile:", profileError.message);
      } else {
        userData = profileData;
        console.log("Retrieved user profile data:", {
          handicapLevel: userData.handicap_level,
          goals: userData.selected_goals?.length || 0,
          scoreGoal: userData.score_goal,
        });
      }
    }

    // Fetch recent round data if not provided
    if ((!roundData || roundData.length === 0) && userId) {
      const { data: fetchedRounds, error: roundsError } = await supabaseAdmin
        .from('rounds')
        .select('*, hole_scores(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (roundsError) {
        console.warn("Error fetching rounds:", roundsError.message);
      } else if (fetchedRounds && fetchedRounds.length > 0) {
        roundData = fetchedRounds;
        console.log(`Retrieved ${roundData.length} recent rounds`);
      }
    }

    // Fetch challenge results
    let challengeResults = [];
    if (userId) {
      const { data: userChallenges, error: challengesError } = await supabaseAdmin
        .from('user_challenge_progress')
        .select('*, challenge_id(*)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (challengesError) {
        console.warn("Error fetching challenge results:", challengesError.message);
      } else if (userChallenges && userChallenges.length > 0) {
        challengeResults = userChallenges;
        console.log(`Retrieved ${challengeResults.length} challenge results`);
      }
    }

    // Fetch available challenges with better logging
    const { data: challenges, error } = await supabaseAdmin
      .from('challenges')
      .select('*');

    if (error) {
      console.error("Error fetching challenges:", error);
      // Continue with default challenge creation
    }
    
    // If challenges are found, log them for debugging
    if (challenges && challenges.length > 0) {
      console.log(`Retrieved ${challenges.length} challenges from database`);
      
      // Log some challenge categories and metrics for debugging
      const challengeCategories = [...new Set(challenges.map(c => c.category))];
      console.log("Available challenge categories:", challengeCategories);
      
      if (specificProblem.toLowerCase().includes('putt')) {
        const puttingChallenges = challenges.filter(c => 
          c.category?.toLowerCase() === 'putting' || 
          c.title?.toLowerCase().includes('putt')
        );
        console.log(`Found ${puttingChallenges.length} putting-related challenges`);
      }
    } else {
      console.log("No challenges found in the database");
    }
    
    // Create plan generator instance with enhanced user data
    const planGenerator = new PlanGenerator(
      roundData,
      specificProblem,
      planDuration,
      availableDrills,
      {
        userData: userData || { handicap_level: handicapLevel },
        challengeResults
      }
    );

    // If no challenges found in database, use default challenges based on problem
    if (!challenges || challenges.length === 0) {
      console.error("No challenges found in database. Creating default challenge.");
      
      // Generate the practice plan with a default challenge
      const response = await planGenerator.generatePlan([]);
      
      console.log("Plan generation complete with default challenge");
      console.log("Challenge assigned:", response.practicePlan.challenge?.title || "None");

      if (!response.practicePlan.challenge) {
        console.error("No challenge in response");
      }

      return ResponseHandler.createSuccessResponse(
        response,
        availableDrills,
        planDuration,
        userData,
        isAIGenerated
      );
    }
    
    // Generate the practice plan
    const response = await planGenerator.generatePlan(challenges);

    console.log("Plan generation complete with diagnosis length:", response.diagnosis.length);
    console.log("Challenge assigned:", response.practicePlan.challenge?.title || "None");

    if (!response.practicePlan.challenge) {
      console.error("No challenge in response");
    }

    return ResponseHandler.createSuccessResponse(
      response,
      availableDrills,
      planDuration,
      userData,
      isAIGenerated
    );
  } catch (error) {
    console.error('Error:', error);
    return ResponseHandler.createErrorResponse(error);
  }
});
