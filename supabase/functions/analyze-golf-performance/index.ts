
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_MODEL = 'gpt-4o-mini';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { 
      userId, 
      roundData, 
      handicapLevel, 
      specificProblem,
      planDuration,
      availableDrills 
    } = await req.json();

    console.log("Processing request with params:", {
      userId,
      handicapLevel,
      specificProblem,
      planDuration,
      availableDrillsCount: availableDrills?.length || 0
    });

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Prepare drill data for the prompt - simplify to reduce token usage
    const simplifiedDrills = (availableDrills || []).map(drill => ({
      id: drill.id,
      title: drill.title,
      focus: drill.focus,
      category: drill.category,
      difficulty: drill.difficulty
    }));

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ALLOWED_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a professional golf coach creating targeted practice plans. Based on the golfer's specific problem and skill level, select drills that directly address their issues. For each day:
            1. Choose a specific focus area related to their main problem
            2. Select 2-3 drills that work together to improve that focus area
            3. Specify appropriate sets and reps based on drill difficulty and golfer level
            4. Ensure progression across multiple days
            5. Return only drill IDs with specific sets/reps configurations`
          },
          {
            role: 'user',
            content: `Create a ${planDuration}-day practice plan for a ${handicapLevel} golfer working on: "${specificProblem}".
            Recent performance data: ${JSON.stringify(roundData || [])}
            Available drills: ${JSON.stringify(simplifiedDrills)}
            Return ONLY a JSON object with diagnosis, root causes, and a daily plan specifying drill IDs and sets/reps.`
          }
        ],
        temperature: 0.2,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API call failed');
    }

    const aiResponse = await openAIResponse.json();
    console.log("Received response from OpenAI");
    
    // Parse the response content
    let response;
    try {
      response = JSON.parse(aiResponse.choices[0].message.content);
      console.log("Successfully parsed OpenAI response");
    } catch (e) {
      console.error("Failed to parse OpenAI response:", e);
      throw new Error('Failed to generate practice plan');
    }

    // Map drill IDs to actual drill objects
    const mappedDailyPlans = response.dailyPlans.map(day => ({
      ...day,
      drills: day.drills.map(drill => {
        const fullDrill = availableDrills?.find(d => d.id === drill.id);
        if (!fullDrill) {
          console.warn(`Drill with ID ${drill.id} not found`);
          return null;
        }
        return {
          drill: fullDrill,
          sets: drill.sets,
          reps: drill.reps
        };
      }).filter(Boolean)
    }));

    return new Response(
      JSON.stringify({
        diagnosis: response.diagnosis,
        rootCauses: response.rootCauses,
        practicePlan: {
          plan: mappedDailyPlans
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        diagnosis: "Error generating practice plan", 
        rootCauses: ["Technical issue encountered"],
        practicePlan: {
          plan: []
        } 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
