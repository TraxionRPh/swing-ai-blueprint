
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
    
    let challenges = [];
    if (challengeResponse.ok) {
      challenges = await challengeResponse.json();
      console.log(`Fetched ${challenges?.length || 0} challenges from database`);
      
      // Log all challenge titles and content for debugging
      if (challenges?.length > 0) {
        console.log("Available challenges:");
        challenges.forEach((c, i) => {
          console.log(`[${i+1}] ${c.title || 'Untitled'} | Category: ${c.category || 'None'} | Contains 'bunker': ${(c.title + c.description + c.instruction1 + c.instruction2 + c.instruction3).toLowerCase().includes('bunker')}`);
        });
      }
    } else {
      console.error("Failed to fetch challenges");
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
- Bunker issues: Look for drills specifically mentioning "bunker", "sand", or "explosion shot"

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
    
    // Extract drill IDs from AI response with improved pattern matching
    const drillIds = recommendationText.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g) || [];
    console.log("Extracted drill IDs:", drillIds);
    
    // Get the recommended drills in order
    const recommendedDrills = drillIds
      .map(id => drills.find(d => d.id === id))
      .filter(Boolean)
      .slice(0, 5); // Limit to top 5 drills
    
    console.log(`Found ${recommendedDrills.length} recommended drills`);
    
    // Select a relevant challenge based on the query
    let selectedChallenge = null;
    const lowerQuery = query.toLowerCase();
    
    if (challenges && challenges.length > 0) {
      console.log("Selecting a relevant challenge for:", lowerQuery);
      
      // Enhanced handling for bunker-related queries
      if (lowerQuery.includes('bunker') || lowerQuery.includes('sand')) {
        console.log("🏖️ DETECTED BUNKER-RELATED QUERY - Special handling enabled");
        
        // First try to find an exact bunker challenge with higher priority on title and category
        const bunkerChallenges = challenges.filter(c => 
          (c.title && c.title.toLowerCase().includes('bunker')) || 
          (c.category && c.category.toLowerCase().includes('bunker')) ||
          (c.description && c.description.toLowerCase().includes('bunker'))
        );
        
        console.log(`Found ${bunkerChallenges.length} potential bunker challenges`);
        
        // Enhanced scoring system for bunker challenges
        if (bunkerChallenges.length > 0) {
          const scoredChallenges = bunkerChallenges.map(c => {
            const text = [
              c.title || '',
              c.description || '', 
              c.category || '',
              c.instruction1 || '',
              c.instruction2 || '',
              c.instruction3 || ''
            ].join(' ').toLowerCase();
            
            let score = 0;
            
            // Scoring based on bunker terminology in different fields
            if ((c.title || '').toLowerCase().includes('bunker')) score += 10;
            if ((c.category || '').toLowerCase().includes('bunker')) score += 8;
            if ((c.instruction1 || '').toLowerCase().includes('bunker') || 
                (c.instruction1 || '').toLowerCase().includes('sand')) score += 6;
            if ((c.instruction2 || '').toLowerCase().includes('bunker') || 
                (c.instruction2 || '').toLowerCase().includes('sand')) score += 5;
            if (text.includes('explosion')) score += 7;
            if (text.includes('sand shot')) score += 7;
            if (text.includes('splash')) score += 6;
            
            console.log(`Challenge "${c.title}" scored: ${score}`);
            
            return { challenge: c, score };
          });
          
          // Sort by score and select highest
          const sortedChallenges = scoredChallenges.sort((a, b) => b.score - a.score);
          if (sortedChallenges[0] && sortedChallenges[0].score > 0) {
            selectedChallenge = sortedChallenges[0].challenge;
            console.log(`Selected bunker challenge: ${selectedChallenge.title} with score ${sortedChallenges[0].score}`);
          }
        }
      } 
      
      // If no specific challenge found yet, use AI to select the most relevant challenge
      if (!selectedChallenge) {
        try {
          console.log("Using AI to select a challenge");
          const challengeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: `You are a golf coach selecting the most appropriate challenge for a golfer's specific problem.
                  
                  Analyze the golfer's issue and available challenges. Select the challenge that most directly addresses 
                  the specific skill problem they're facing. Consider the challenge's focus, difficulty, and instructions.
                  
                  For bunker issues, prioritize challenges with sand or bunker mentions.
                  For putting issues, prioritize putting-specific challenges.
                  
                  Return ONLY the ID of the single most relevant challenge.
                  Your response should consist of ONLY a UUID in the format: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"`
                },
                {
                  role: 'user',
                  content: `Golfer's issue: "${query}"\n\nAvailable challenges:\n${JSON.stringify(challenges, null, 2)}`
                }
              ],
              temperature: 0.2,
            }),
          });
          
          if (challengeResponse.ok) {
            const challengeAI = await challengeResponse.json();
            const challengeIdText = challengeAI.choices[0].message.content;
            const challengeId = challengeIdText.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
            
            if (challengeId) {
              selectedChallenge = challenges.find(c => c.id === challengeId[0]);
              console.log("AI selected challenge:", selectedChallenge ? selectedChallenge.title : "None");
            }
          }
        } catch (error) {
          console.error("Error selecting challenge with AI:", error);
        }
      }
    }

    // Generate a more detailed analysis with clearer, actionable advice
    let analysisText = "";
    if (recommendedDrills.length > 0) {
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
              content: `You are a professional golf coach. Provide a concise explanation (120-150 words) of:
1. The likely root cause of the golfer's issue
2. Why the recommended drills will effectively address this issue
3. How to get the most out of these drills (key focus areas)

Be specific but accessible. Use technical terms but explain them clearly.`
            },
            {
              role: 'user',
              content: `User's issue: "${query}"\n\nRecommended drills: ${JSON.stringify(recommendedDrills.map(d => ({
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

    return new Response(
      JSON.stringify({ 
        drills: recommendedDrills,
        analysis: analysisText,
        challenge: selectedChallenge
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
