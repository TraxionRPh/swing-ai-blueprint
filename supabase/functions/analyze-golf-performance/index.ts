
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

    const { userId, roundData, handicapLevel, goals, specificProblem, planDuration } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Generate the prompt with plan duration
    const prompt = generatePrompt({ userId, roundData, handicapLevel, goals, specificProblem, planDuration });

    // Get analysis from OpenAI
    const analysisText = await generateAnalysis(prompt, OPENAI_API_KEY);
    
    // Parse the JSON response from OpenAI
    let analysisData;
    let practicePlanData = null;
    try {
      console.log('Raw analysis text:', analysisText);
      // Clean the response if it contains any markdown or code block formatting
      const cleanedText = analysisText.replace(/```json|```/g, '').trim();
      const parsedResponse = JSON.parse(cleanedText);
      analysisData = parsedResponse;
      
      if ((specificProblem || planDuration) && parsedResponse.problem) {
        practicePlanData = parsedResponse;
        
        // Ensure the practice plan has the right number of sessions based on planDuration
        if (planDuration && practicePlanData.practicePlan && practicePlanData.practicePlan.sessions) {
          const days = parseInt(planDuration) || 1;
          // If we have fewer sessions than requested days, add more
          while (practicePlanData.practicePlan.sessions.length < days) {
            const dayNum = practicePlanData.practicePlan.sessions.length + 1;
            practicePlanData.practicePlan.sessions.push({
              focus: `Day ${dayNum} Practice`,
              drills: practicePlanData.recommendedDrills.slice(0, 2).map(d => d.name),
              duration: "45 minutes"
            });
          }
          
          // If we have more sessions than requested days, trim the list
          if (practicePlanData.practicePlan.sessions.length > days) {
            practicePlanData.practicePlan.sessions = practicePlanData.practicePlan.sessions.slice(0, days);
          }
        }
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
      console.error('Error parsing OpenAI response:', error);
      console.error('Problematic response:', analysisText);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Error parsing OpenAI response: ${error.message}`,
        rawResponse: analysisText 
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
