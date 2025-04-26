
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { generateAnalysis } from "./openai.ts";
import { generatePrompt } from "./prompt.ts";
import { savePracticePlan } from "./database.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { userId, roundData, handicapLevel, goals, specificProblem } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Generate the prompt
    const prompt = generatePrompt({ userId, roundData, handicapLevel, goals, specificProblem });

    // Get analysis from OpenAI
    const analysisText = await generateAnalysis(prompt, OPENAI_API_KEY);
    
    // Parse the JSON response from OpenAI
    let analysisData;
    let practicePlanData = null;
    try {
      const parsedResponse = JSON.parse(analysisText);
      analysisData = parsedResponse;
      
      if (specificProblem && parsedResponse.problem) {
        practicePlanData = parsedResponse;
      }

      // Save to database
      await savePracticePlan(
        userId,
        specificProblem,
        practicePlanData,
        analysisData,
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );

      return new Response(JSON.stringify({
        success: true,
        analysis: analysisData,
        practicePlan: practicePlanData
      }), {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      });

    } catch (error) {
      console.error('Error in analyze-golf-performance function:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
