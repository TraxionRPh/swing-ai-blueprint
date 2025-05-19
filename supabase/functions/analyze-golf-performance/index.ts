import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { cors } from './_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { OpenAI } from './openai.ts';
import { PlanGenerator } from './planGenerator.ts';
import { ResponseHandler } from './responseHandler.ts';

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
      return cors(req, new Response(
        JSON.stringify({ error: 'Expected "application/json" Content-Type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ));
    }
    
    // Parse the body of the request
    const { userId, roundData, handicapLevel, specificProblem, planDuration, availableDrills, availableChallenges } = await req.json();

    console.log("Request received:", { userId, handicapLevel, specificProblem, planDuration });

    // Ensure we have drills to work with
    let drillsToUse = availableDrills || [];
    
    // If drills array is empty or very small, we should provide some fallback drills
    if (!drillsToUse || drillsToUse.length < 3) {
      console.log("Using fallback drills since few or no drills were provided");
      drillsToUse = [];
    }

    // CATEGORY-BASED FILTERING: Apply strict category filtering based on problem type
    
    // PUTTING: If this is a putting-related problem, ONLY use putting drills
    const isPuttingProblem = specificProblem?.toLowerCase().includes('putt') || 
                            specificProblem?.toLowerCase().includes('green') ||
                            specificProblem?.toLowerCase().includes('lag');
                            
    // DRIVING: If this is a driving-related problem, ONLY use driving drills
    const isDrivingProblem = specificProblem?.toLowerCase().includes('driver') ||
                            specificProblem?.toLowerCase().includes('tee shot') ||
                            specificProblem?.toLowerCase().includes('slice') ||
                            specificProblem?.toLowerCase().includes('hook') ||
                            specificProblem?.toLowerCase().includes('off the tee');
                           
    // IRON PLAY: If this is an iron play problem, ONLY use iron drills
    const isIronPlayProblem = specificProblem?.toLowerCase().includes('iron') ||
                             specificProblem?.toLowerCase().includes('approach') ||
                             specificProblem?.toLowerCase().includes('ball striking') ||
                             specificProblem?.toLowerCase().includes('contact');
                           
    // CHIPPING: If this is a chipping/short game problem, ONLY use chipping drills
    const isChippingProblem = specificProblem?.toLowerCase().includes('chip') ||
                             specificProblem?.toLowerCase().includes('pitch') ||
                             specificProblem?.toLowerCase().includes('short game');
                           
    // BUNKER: If this is a bunker/sand problem, ONLY use bunker drills
    const isBunkerProblem = specificProblem?.toLowerCase().includes('bunker') || 
                           specificProblem?.toLowerCase().includes('sand');
                           
    // Apply the appropriate filters based on problem type
    if (isPuttingProblem) {
      console.log("This is a putting-related problem, strictly enforcing putting drills only");
      
      // Filter to only include drills with 'putting' category
      const puttingDrills = drillsToUse.filter((d: any) => 
        (d.category?.toLowerCase() === 'putting'));
        
      // If we don't have enough putting-specific drills, add our fallbacks
      if (!puttingDrills.length || puttingDrills.length < 3) {
        console.log("Adding fallback putting drills for putting problem");
        drillsToUse = [...(puttingDrills || []), ...fallbackPuttingDrills];
      } else {
        console.log(`Using ${puttingDrills.length} putting-specific drills only`);
        drillsToUse = puttingDrills;
      }
    }
    else if (isDrivingProblem) {
      console.log("This is a driving-related problem, strictly enforcing driving drills only");
      
      // Filter to only include drills with 'driving' category
      const drivingDrills = drillsToUse.filter((d: any) => 
        (d.category?.toLowerCase() === 'driving' || 
         d.category?.toLowerCase().includes('tee')));
        
      if (drivingDrills.length >= 3) {
        console.log(`Using ${drivingDrills.length} driving-specific drills only`);
        drillsToUse = drivingDrills;
      } else {
        console.log("Not enough driving drills, using broader selection with relevant drills prioritized");
        // We don't have fallbacks for this, so we keep existing drills but will filter in PlanGenerator
      }
    }
    else if (isIronPlayProblem) {
      console.log("This is an iron play problem, strictly enforcing iron drills only");
      
      // Filter to only include drills with 'iron' or 'approach' category
      const ironDrills = drillsToUse.filter((d: any) => 
        (d.category?.toLowerCase().includes('iron') || 
         d.category?.toLowerCase().includes('approach') ||
         d.category?.toLowerCase().includes('ball striking')));
        
      if (ironDrills.length >= 3) {
        console.log(`Using ${ironDrills.length} iron-specific drills only`);
        drillsToUse = ironDrills;
      }
    }
    else if (isChippingProblem) {
      console.log("This is a chipping/short game problem, strictly enforcing short game drills only");
      
      // Filter to only include drills with 'short game', 'chip' or 'pitch' category
      const chippingDrills = drillsToUse.filter((d: any) => 
        (d.category?.toLowerCase().includes('chip') || 
         d.category?.toLowerCase().includes('pitch') ||
         d.category?.toLowerCase().includes('short game')));
        
      if (chippingDrills.length >= 3) {
        console.log(`Using ${chippingDrills.length} chipping-specific drills only`);
        drillsToUse = chippingDrills;
      }
    }
    else if (isBunkerProblem) {
      console.log("This is a bunker problem, strictly enforcing bunker drills only");
      
      // Filter to only include drills with 'bunker' or 'sand' category
      const bunkerDrills = drillsToUse.filter((d: any) => 
        (d.category?.toLowerCase().includes('bunker') || 
         d.category?.toLowerCase().includes('sand')));
        
      if (bunkerDrills.length >= 3) {
        console.log(`Using ${bunkerDrills.length} bunker-specific drills only`);
        drillsToUse = bunkerDrills;
      }
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
    return cors(req, ResponseHandler.createSuccessResponse(plan, drillsToUse, planDuration, null, true));
  } catch (error) {
    console.error('Failed to process request', error);
    return cors(req, ResponseHandler.createErrorResponse(error));
  }
});
