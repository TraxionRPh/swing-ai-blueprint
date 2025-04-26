
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

    // First, get all drills from the database
    const { data: drills, error: dbError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/drills`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        },
      }
    ).then(res => res.json());

    if (dbError) throw dbError;

    // Use OpenAI with strictly enforced model
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
            content: 'You are a golf coach assistant. Your task is to analyze the user\'s golf issue and select the top 3 most relevant drills from the provided list. Return only the IDs of the three best matching drills in order of relevance.'
          },
          {
            role: 'user',
            content: `User's golf issue: "${query}"\n\nAvailable drills:\n${JSON.stringify(drills, null, 2)}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'OpenAI API call failed');
    }

    const aiResponse = await openAIResponse.json();
    const recommendationText = aiResponse.choices[0].message.content;
    
    // Extract drill IDs from AI response
    const drillIds = recommendationText.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g) || [];
    
    // Get the recommended drills in order
    const recommendedDrills = drillIds
      .map(id => drills.find(d => d.id === id))
      .filter(Boolean)
      .slice(0, 3);

    return new Response(
      JSON.stringify({ drills: recommendedDrills }),
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
