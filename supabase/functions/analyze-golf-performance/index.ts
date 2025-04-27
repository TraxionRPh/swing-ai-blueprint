
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { AnalyzeRequest } from "./types.ts";
import { PlanGenerator } from "./planGenerator.ts";
import { ResponseHandler } from "./responseHandler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Create plan generator instance
    const planGenerator = new PlanGenerator(
      roundData,
      specificProblem,
      planDuration,
      availableDrills
    );

    // Fetch available challenges
    const { data: challenges } = await supabaseAdmin
      .from('challenges')
      .select('*');

    // Generate the practice plan
    const response = await planGenerator.generatePlan(challenges || []);

    return ResponseHandler.createSuccessResponse(
      response,
      availableDrills,
      planDuration
    );
  } catch (error) {
    return ResponseHandler.createErrorResponse(error);
  }
});
