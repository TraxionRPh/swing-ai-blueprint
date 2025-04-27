import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constant for enforcing model choice
const ALLOWED_MODEL = 'gpt-4o-mini';

serve(async (req) => {
  try {
    const { 
      userId, 
      roundData, 
      handicapLevel, 
      specificProblem,
      planDuration,
      availableDrills 
    } = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const messages = [
      {
        role: "system",
        content: "You are a professional golf coach helping create personalized practice plans. Use the available drills to create specific day-by-day practice routines."
      },
      {
        role: "user",
        content: `Create a ${planDuration}-day practice plan for a ${handicapLevel} golfer working on: ${specificProblem}. 
        Available drills: ${JSON.stringify(availableDrills)}`
      }
    ];

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
            content: `Analyze the following golfer profile and create a practice plan:\n\nGolfer Details:\n- User ID: ${userId}\n- Handicap Level: ${handicapLevel}\n- Specific Problem: ${specificProblem}\n- Round Data: ${JSON.stringify(roundData)}\n\nInstructions:\n1. Diagnose the golfer's primary issue based on their handicap level, specific problem, and round data.\n2. Identify the root causes of the diagnosed issue.\n3. Create a ${planDuration}-day practice plan with specific drills for each day. Each day should focus on one key aspect and include 2-3 drills.\n4. Return the diagnosis, root causes, and practice plan in a JSON format.\n\nExample Format:\n{\n  "diagnosis": "The golfer is struggling with consistent ball striking, leading to inconsistent distances and accuracy.",\n  "rootCauses": ["Inconsistent swing path", "Poor weight transfer", "Incorrect clubface angle"],\n  "dailyPlans": [\n    {\n      "day": 1,\n      "focus": "Improving Swing Path",\n      "drills": [\n        { "id": "drill1", "sets": 3, "reps": 10 },\n        { "id": "drill2", "sets": 3, "reps": 10 }\n      ]\n    },\n    {\n      "day": 2,\n      "focus": "Enhancing Weight Transfer",\n      "drills": [\n        { "id": "drill3", "sets": 3, "reps": 10 },\n        { "id": "drill4", "sets": 3, "reps": 10 }\n      ]\n    }\n  ]\n}`
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
    const response = JSON.parse(aiResponse.choices[0].message.content);

    return new Response(
      JSON.stringify({
        diagnosis: response.diagnosis,
        rootCauses: response.rootCauses,
        practicePlan: {
          plan: response.dailyPlans.map(day => ({
            ...day,
            drills: day.drills.map(drill => ({
              drill: availableDrills.find(d => d.id === drill.id) || availableDrills[0],
              sets: drill.sets || 3,
              reps: drill.reps || 10
            }))
          }))
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
