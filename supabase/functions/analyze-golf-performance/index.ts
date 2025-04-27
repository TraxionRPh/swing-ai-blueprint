
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { cors } from './_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { OpenAI } from './openai.ts';
import { PlanGenerator } from './planGenerator.ts';
import { responseHandler } from './_shared/utils.ts';

// Import our fallback putting drills if needed
import { fallbackPuttingDrills } from './utils/puttingDrills.ts';

const apiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!apiKey) {
  console.error('OPENAI_API_KEY is not set');
  Deno.exit(1);
}

if (!supabaseUrl) {
  console.error('SUPABASE_URL is not set');
  Deno.exit(1);
}

if (!supabaseKey) {
  console.error('SUPABASE_ANON_KEY is not set');
  Deno.exit(1);
}

const openai = new OpenAI({ apiKey });
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return cors(req, new Response('ok'));
  }

  // Process the request
  try {
    // First, check that the content type is JSON
    if (req.headers.get('content-type') !== 'application/json') {
      return responseHandler.error('Expected "application/json" Content-Type', 400);
    }
    
    // Parse the body of the request
    const { userId, roundData, handicapLevel, specificProblem, planDuration, availableDrills, availableChallenges } = await req.json();

    // Ensure we have drills to work with
    let drillsToUse = availableDrills || [];
    
    // If drills array is empty or very small, we should provide some fallback drills
    if (!drillsToUse || drillsToUse.length < 3) {
      console.log("Using fallback drills since few or no drills were provided");
      drillsToUse = [];
    }

    // If this is a putting-related problem, make sure we have putting drills
    if (specificProblem.toLowerCase().includes('putt') && 
        !drillsToUse.some((d: any) => 
          (d.category?.toLowerCase() === 'putting') || 
          (d.title?.toLowerCase()?.includes('putt')))) {
      console.log("Adding fallback putting drills for putting problem");
      drillsToUse = [...drillsToUse, ...fallbackPuttingDrills];
    }

    // Create a plan generator with our available data
    const planGenerator = new PlanGenerator(
      roundData || [],
      specificProblem || "Improve overall golf performance",
      planDuration || "1",
      drillsToUse,
      { userData: { handicap_level: handicapLevel } }
    );

    // Create a practice plan
    const plan = await planGenerator.generatePlan(availableChallenges || []);

    // Return the plan
    return cors(req, responseHandler.success(plan));
  } catch (error) {
    console.error('Failed to process request', error);
    return cors(req, responseHandler.error(error.message, 500));
  }
});
