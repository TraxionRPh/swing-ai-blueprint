
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { selectRelevantChallenge } from "./utils/challenge-matcher.ts";
import { extractDrillIds, getRecommendedDrills, generateAISystemPrompt, generateAnalysisPrompt, isPuttingRelated } from "./utils/drill-analyzer.ts";
import type { Drill, Challenge, SearchResponse } from "./types.ts";

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
    
    const drillsResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/drills?select=*`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        },
      }
    );
    
    if (!drillsResponse.ok) {
      throw new Error(`Failed to fetch drills: ${drillsResponse.status} ${drillsResponse.statusText}`);
    }
    
    const drills = await drillsResponse.json() as Drill[];
    
    console.log(`Fetched ${drills?.length || 0} drills from database`);
    
    if (!drills || drills.length === 0) {
      console.error("No drills found in database");
      throw new Error("No drills available in the database");
    }
    
    // Also fetch challenges to include them in our recommendations
    console.log("Fetching challenges from database...");
    
    const challengeResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/challenges?select=*`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        },
      }
    );
    
    let challenges: Challenge[] = [];
    if (challengeResponse.ok) {
      challenges = await challengeResponse.json() as Challenge[];
      console.log(`Fetched ${challenges?.length || 0} challenges from database`);
    } else {
      console.error("Failed to fetch challenges");
    }

    // Check if this is a putting-related query
    const isPuttingQuery = query.toLowerCase().includes('putt') || 
                         query.toLowerCase().includes('green') ||
                         query.toLowerCase().includes('hole');
    
    // If it's a putting query, filter to only putting drills before sending to AI
    let drillsToSearch = drills;
    if (isPuttingQuery) {
      const puttingDrills = drills.filter(drill => isPuttingRelated(drill));
      console.log(`Found ${puttingDrills.length} putting-specific drills for putting query`);
      
      if (puttingDrills.length > 0) {
        drillsToSearch = puttingDrills;
      }
    }

    // Use OpenAI with strictly enforced model and improved prompting
    console.log("Calling OpenAI API...");
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
            content: generateAISystemPrompt()
          },
          {
            role: 'user',
            content: `User's golf issue: "${query}"\n\nAvailable drills:\n${JSON.stringify(drillsToSearch, null, 2)}`
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
    
    // Extract drill IDs from AI response with improved pattern matching
    const drillIds = extractDrillIds(recommendationText);
    console.log("Extracted drill IDs:", drillIds);
    
    // Get the recommended drills in order
    const recommendedDrills = getRecommendedDrills(drillsToSearch, drillIds);
    
    console.log(`Found ${recommendedDrills.length} recommended drills`);
    
    // Post-process to ensure relevance - if it's a putting query but we don't have putting drills
    // in the recommendations, try to add some putting-specific drills
    let finalRecommendedDrills = recommendedDrills;
    if (isPuttingQuery && !recommendedDrills.some(drill => isPuttingRelated(drill))) {
      console.log("Ensuring putting drills are included for putting query");
      const puttingDrills = drills.filter(drill => isPuttingRelated(drill));
      if (puttingDrills.length > 0) {
        // Take up to 3 putting drills to supplement recommendations
        const additionalPuttingDrills = puttingDrills.slice(0, 3);
        finalRecommendedDrills = [...additionalPuttingDrills, ...recommendedDrills]
          .slice(0, Math.max(3, recommendedDrills.length)); // Keep at least 3 drills
      }
    }
    
    // Select a relevant challenge based on the query
    const selectedChallenge = selectRelevantChallenge(challenges, query);

    // Generate a more detailed analysis with clearer, actionable advice
    let analysisText = "";
    if (finalRecommendedDrills.length > 0) {
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
              content: generateAnalysisPrompt()
            },
            {
              role: 'user',
              content: `User's issue: "${query}"\n\nRecommended drills: ${JSON.stringify(finalRecommendedDrills.map(d => ({
                title: d.title,
                overview: d.overview,
                focus: d.focus
              })), null, 2)}${selectedChallenge ? `\n\nSelected challenge: ${JSON.stringify({
                title: selectedChallenge.title,
                description: selectedChallenge.description
              })}` : ''}`
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

    const searchResult: SearchResponse = { 
      drills: finalRecommendedDrills,
      analysis: analysisText,
      challenge: selectedChallenge
    };

    return new Response(
      JSON.stringify(searchResult),
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
