
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Parse the request body
    const { userId, roundData, handicapLevel, goals, specificProblem } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Create a prompt for OpenAI based on the golf data
    const prompt = `
      You are a professional golf coach and analyst. Based on the following data about a golfer,
      provide a detailed analysis of their performance, identify their strengths and weaknesses,
      and recommend specific practice drills.
      
      Player Data:
      - Handicap Level: ${handicapLevel || 'Not specified'}
      - Goals: ${goals || 'Improve overall game'}
      ${specificProblem ? `- Specific Problem: ${specificProblem}` : ''}
      
      Recent Performance:
      ${JSON.stringify(roundData || {})}
      
      Format your response as JSON with the following structure:
      {
        "performanceAnalysis": {
          "driving": number (0-100),
          "ironPlay": number (0-100),
          "chipping": number (0-100),
          "bunker": number (0-100),
          "putting": number (0-100)
        },
        "aiConfidence": number (0-100),
        "identifiedIssues": [
          {
            "area": string,
            "description": string,
            "priority": "High" | "Medium" | "Low"
          }
        ],
        "recommendedPractice": {
          "weeklyFocus": string,
          "primaryDrill": {
            "name": string,
            "description": string,
            "frequency": string
          },
          "secondaryDrill": {
            "name": string,
            "description": string,
            "frequency": string
          },
          "weeklyAssignment": string
        }
      }
      
      ${specificProblem ? `
      Additionally, since the player mentioned a specific problem ("${specificProblem}"), please provide a tailored practice plan in this format:
      {
        "problem": string,
        "diagnosis": string,
        "rootCauses": string[],
        "recommendedDrills": [
          {
            "name": string,
            "description": string,
            "difficulty": "Beginner" | "Intermediate" | "Advanced",
            "duration": string,
            "focus": string[]
          }
        ],
        "practicePlan": {
          "duration": string,
          "frequency": string,
          "sessions": [
            {
              "focus": string,
              "drills": string[],
              "duration": string
            }
          ]
        }
      }
      ` : ''}
    `;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional golf coach and analyst specialized in providing performance analysis and practice plans.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });
    
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const openAIData = await openAIResponse.json();
    const analysisText = openAIData.choices[0].message.content;
    
    // Parse the JSON response from OpenAI
    let analysisData;
    let practicePlanData = null;
    try {
      // The response might contain both analysis and practice plan
      const responseData = JSON.parse(analysisText);
      
      // If specificProblem was provided, extract the practice plan part
      if (specificProblem && responseData.problem) {
        analysisData = { 
          performanceAnalysis: responseData.performanceAnalysis || {},
          aiConfidence: responseData.aiConfidence || 70,
          identifiedIssues: responseData.identifiedIssues || [],
          recommendedPractice: responseData.recommendedPractice || {}
        };
        
        practicePlanData = {
          problem: responseData.problem,
          diagnosis: responseData.diagnosis,
          rootCauses: responseData.rootCauses,
          recommendedDrills: responseData.recommendedDrills,
          practicePlan: responseData.practicePlan
        };
      } else {
        // Just regular analysis
        analysisData = responseData;
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e, analysisText);
      throw new Error('Failed to parse AI analysis');
    }

    // Store the analysis in the database
    const { data: dbData, error: dbError } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/ai_practice_plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        user_id: userId,
        problem: specificProblem || "Golf performance optimization",
        diagnosis: practicePlanData?.diagnosis || "AI-generated performance analysis",
        root_causes: practicePlanData?.rootCauses || analysisData.identifiedIssues,
        recommended_drills: practicePlanData?.recommendedDrills || [
          analysisData.recommendedPractice.primaryDrill,
          analysisData.recommendedPractice.secondaryDrill
        ],
        practice_plan: practicePlanData || analysisData
      })
    }).then(res => res.json());

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

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
});
