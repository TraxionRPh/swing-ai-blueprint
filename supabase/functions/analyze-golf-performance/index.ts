
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

    // Create a structured prompt that explicitly asks for the required fields
    const systemPrompt = `You are a professional golf coach creating targeted practice plans. Based on the golfer's specific problem and skill level, select drills that directly address their issues. 

You MUST respond with a valid JSON object that has exactly these fields:
1. "diagnosis": A string with an analysis of the golfer's issue
2. "rootCauses": An array of strings with root causes of the issue
3. "dailyPlans": An array of objects with these exact fields:
   - "day": The day number (integer)
   - "focus": The focus area for this day (string)
   - "duration": Estimated time required (string)
   - "drills": Array of objects with:
     - "id": The drill ID (string)
     - "sets": Number of sets (integer)
     - "reps": Number of repetitions (integer)

For each day:
1. Choose a specific focus area related to their main problem
2. Select 2-3 drills that work together to improve that focus area
3. Specify appropriate sets and reps based on drill difficulty and golfer level
4. Ensure progression across multiple days`;

    const userPrompt = `Create a ${planDuration}-day practice plan for a ${handicapLevel} golfer working on: "${specificProblem}".
Recent performance data: ${JSON.stringify(roundData || [])}
Available drills: ${JSON.stringify(simplifiedDrills)}

YOUR RESPONSE MUST BE A VALID JSON OBJECT with diagnosis, rootCauses, and dailyPlans as described in your instructions.`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        response_format: { type: "json_object" }, // Explicitly request JSON format
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

    // More explicit validation of the response structure
    if (!response.diagnosis || typeof response.diagnosis !== 'string') {
      console.error("Invalid response: missing or invalid diagnosis");
      response.diagnosis = "Analysis of your golf technique completed";
    }

    if (!response.rootCauses || !Array.isArray(response.rootCauses) || response.rootCauses.length === 0) {
      console.error("Invalid response: missing or invalid rootCauses");
      response.rootCauses = ["Technical analysis completed"];
    }

    if (!response.dailyPlans || !Array.isArray(response.dailyPlans) || response.dailyPlans.length === 0) {
      console.error("Invalid response format: dailyPlans is missing, not an array, or empty");
      return new Response(
        JSON.stringify({
          error: "Invalid response format",
          diagnosis: response.diagnosis || "Unable to generate detailed practice plan",
          rootCauses: response.rootCauses || ["Technical issue with AI response format"],
          practicePlan: {
            plan: []
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Map drill IDs to actual drill objects with comprehensive safety checks
    const mappedDailyPlans = response.dailyPlans.map((day, index) => {
      // Ensure all required fields exist with defaults
      const safeDay = {
        day: day.day || index + 1,
        focus: day.focus || `Golf practice day ${index + 1}`,
        duration: day.duration || "30 minutes",
        drills: Array.isArray(day.drills) ? day.drills : []
      };
      
      return {
        ...safeDay,
        drills: safeDay.drills.map(drill => {
          // Skip if drill has no ID
          if (!drill || !drill.id) {
            console.warn("Skipping drill with missing ID");
            return null;
          }

          const fullDrill = availableDrills?.find(d => d.id === drill.id);
          if (!fullDrill) {
            console.warn(`Drill with ID ${drill.id} not found`);
            return null;
          }
          
          return {
            drill: fullDrill,
            sets: typeof drill.sets === 'number' ? drill.sets : 1,
            reps: typeof drill.reps === 'number' ? drill.reps : 10
          };
        }).filter(Boolean) // Remove null entries
      };
    });

    // Final safety check - ensure we have at least some drills
    const finalPlans = mappedDailyPlans.filter(day => day.drills.length > 0);
    
    if (finalPlans.length === 0) {
      console.warn("No valid drills found after mapping");
      
      // If no available drills were provided, explain the issue
      if (!availableDrills || availableDrills.length === 0) {
        return new Response(
          JSON.stringify({
            diagnosis: "Unable to create practice plan - no drills available",
            rootCauses: ["No suitable drills found in the database", "Try adding more drill data or using different search terms"],
            practicePlan: {
              plan: []
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        diagnosis: response.diagnosis || "Golf performance analysis completed",
        rootCauses: response.rootCauses || ["Technical analysis completed"],
        practicePlan: {
          plan: finalPlans.length > 0 ? finalPlans : mappedDailyPlans
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
