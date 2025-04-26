
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constant for enforcing model choice
const ALLOWED_MODEL = 'gpt-4o-mini';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { query } = await req.json();
    console.log("Received search query:", query);

    // First, get all drills from the database using the REST API
    console.log("Fetching drills from database...");
    
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/drills?select=*`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch drills: ${response.status} ${response.statusText}`);
    }
    
    const drills = await response.json();
    
    console.log(`Fetched ${drills?.length || 0} drills from database`);
    
    if (!drills || drills.length === 0) {
      console.error("No drills found in database");
      throw new Error("No drills available in the database");
    }

    // Use OpenAI with strictly enforced model
    console.log("Calling OpenAI API...");
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
            content: `You are a professional golf coach assistant with deep expertise in analyzing golf swing mechanics and training methods. Your task is to carefully analyze the user's golf issue and select the top 3-5 most relevant drills that will directly address their specific problem.

Consider:
1. The exact technical cause of the issue described (e.g., for a hook: closed clubface, in-to-out swing path)
2. How each drill's focus, difficulty, and mechanics match the user's specific needs
3. A progression of drills that builds skills logically

Common golf swing issues and what to look for:
- Hook/Draw issues: Look for drills focused on grip, swing path, clubface control
- Slice/Fade issues: Look for drills about swing path, wrist position, shoulder alignment
- Topped/Fat shots: Look for drills on posture, ball position, weight transfer
- Distance problems: Look for drills on tempo, sequencing, core rotation
- Consistency issues: Look for fundamentals drills on setup, alignment

Look at drill titles, descriptions, focus areas, categories, and difficulty levels to make optimal matches.
Return ONLY the IDs of the best matching drills in order of relevance, with the most effective drill first.
Your response should ONLY contain UUIDs in the format: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" separated by commas or line breaks.`
          },
          {
            role: 'user',
            content: `User's golf issue: "${query}"\n\nAvailable drills:\n${JSON.stringify(drills, null, 2)}`
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
    const recommendationText = aiResponse.choices[0].message.content;
    console.log("AI recommendation text:", recommendationText);
    
    // Extract drill IDs from AI response - look for UUID pattern
    const drillIds = recommendationText.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g) || [];
    console.log("Extracted drill IDs:", drillIds);
    
    // Get the recommended drills in order
    const recommendedDrills = drillIds
      .map(id => drills.find(d => d.id === id))
      .filter(Boolean)
      .slice(0, 5); // Limit to top 5 drills
    
    console.log(`Found ${recommendedDrills.length} recommended drills`);

    // Include analysis text to help users understand the recommendations
    let analysisText = "";
    if (recommendedDrills.length > 0) {
      // Get additional explanation for the recommendations
      const explanationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'You are a professional golf coach. Provide a brief explanation (100 words max) of why these drills will help the user\'s specific problem. Be technical but accessible.'
            },
            {
              role: 'user',
              content: `User's issue: "${query}"\n\nRecommended drills: ${JSON.stringify(recommendedDrills.map(d => d.title + " - " + d.overview), null, 2)}`
            }
          ],
          temperature: 0.3,
        }),
      });
      
      if (explanationResponse.ok) {
        const explanationData = await explanationResponse.json();
        analysisText = explanationData.choices[0].message.content;
      }
    }

    return new Response(
      JSON.stringify({ 
        drills: recommendedDrills,
        analysis: analysisText
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
