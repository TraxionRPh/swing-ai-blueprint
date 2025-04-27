
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constant for enforcing model choice
const ALLOWED_MODEL = 'gpt-4o-mini';

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Log what we received for debugging
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
        model: ALLOWED_MODEL, // Enforced model usage
        messages: [
          {
            role: 'system',
            content: 'You are a professional golf coach with deep expertise in analyzing golf swing mechanics and training methods. Your task is to create a personalized practice plan to improve a golfer\'s performance. The practice plan should include a diagnosis of the golfer\'s issues, the root causes of those issues, and a day-by-day plan of drills to address those issues.'
          },
          {
            role: 'user',
            content: `Analyze the following golfer profile and create a practice plan:\n\nGolfer Details:\n- User ID: ${userId || 'anonymous'}\n- Handicap Level: ${handicapLevel || 'intermediate'}\n- Specific Problem: ${specificProblem || 'Improve overall golf performance'}\n- Round Data: ${JSON.stringify(roundData || [])}\n\nInstructions:\n1. Diagnose the golfer's primary issue based on their handicap level, specific problem, and round data.\n2. Identify the root causes of the diagnosed issue.\n3. Create a ${planDuration || '1'}-day practice plan with specific drills for each day. Each day should focus on one key aspect and include 2-3 drills from the available drills list. Use the drill IDs to reference them.\n4. Return the diagnosis, root causes, and practice plan in a JSON format.\n\nAvailable Drills: ${JSON.stringify(simplifiedDrills)}\n\nExample Format:\n{\n  "diagnosis": "The golfer is struggling with consistent ball striking, leading to inconsistent distances and accuracy.",\n  "rootCauses": ["Inconsistent swing path", "Poor weight transfer", "Incorrect clubface angle"],\n  "dailyPlans": [\n    {\n      "day": 1,\n      "focus": "Improving Swing Path",\n      "drills": [\n        { "id": "drill-id-1", "sets": 3, "reps": 10 },\n        { "id": "drill-id-2", "sets": 3, "reps": 10 }\n      ]\n    },\n    {\n      "day": 2,\n      "focus": "Enhancing Weight Transfer",\n      "drills": [\n        { "id": "drill-id-3", "sets": 3, "reps": 10 },\n        { "id": "drill-id-4", "sets": 3, "reps": 10 }\n      ]\n    }\n  ]\n}`
          }
        ],
        temperature: 0.7,
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
      console.log("Raw response content:", aiResponse.choices[0].message.content);
      
      // Provide a fallback response
      response = {
        diagnosis: "Failed to generate a complete analysis. The system encountered an issue processing your request.",
        rootCauses: ["Technical issue with AI response"],
        dailyPlans: Array.from({ length: parseInt(planDuration) || 1 }, (_, i) => ({
          day: i + 1,
          focus: "General Golf Practice",
          drills: (availableDrills || []).slice(0, 2).map(drill => ({
            id: drill.id,
            sets: 3,
            reps: 10
          }))
        }))
      };
    }

    // Map drill IDs to actual drill objects
    const mappedDailyPlans = response.dailyPlans.map(day => ({
      ...day,
      drills: day.drills.map(drill => {
        const fullDrill = availableDrills?.find(d => d.id === drill.id) || availableDrills?.[0];
        return {
          drill: fullDrill,
          sets: drill.sets || 3,
          reps: drill.reps || 10
        };
      }).filter(Boolean).slice(0, 3) // Ensure we have valid drills, max 3
    }));

    // If we somehow have no drills, add some defaults
    if (mappedDailyPlans.some(day => day.drills.length === 0)) {
      console.log("Adding default drills to days with no drills");
      mappedDailyPlans.forEach(day => {
        if (day.drills.length === 0 && availableDrills?.length) {
          day.drills = availableDrills.slice(0, 2).map(drill => ({
            drill,
            sets: 3,
            reps: 10
          }));
        }
      });
    }

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
