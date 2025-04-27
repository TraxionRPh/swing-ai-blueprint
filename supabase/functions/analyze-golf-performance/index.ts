
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { getDrillRelevanceScore } from "./drillMatching.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_MODEL = 'gpt-4o-mini';

const sampleDrills = [
  {
    id: "7c5d6a9e-3b2f-4c1a-8d7e-5f9b6c2a3d8e",
    title: "Alignment Rod Path Drill",
    description: "Improve swing path and alignment",
    overview: "Use alignment rods to visualize and correct your swing path",
    category: "driving",
    focus: ["swing path", "alignment", "driver"],
    difficulty: "Intermediate",
    duration: "15 minutes",
    instruction1: "Place one alignment rod on the ground pointing at your target",
    instruction2: "Place another rod parallel to the first, creating a channel",
    instruction3: "Practice swinging along the channel to improve your path",
    common_mistake1: "Swinging too much from outside-in",
    common_mistake2: "Not maintaining proper alignment throughout swing",
    pro_tip: "Focus on shoulder rotation staying parallel to the alignment rods"
  },
  {
    id: "9a8b7c6d-5e4f-3g2h-1i0j-6k5l4m3n2o1p",
    title: "Towel Under Arms Drill",
    description: "Improve connection and swing plane",
    overview: "Placing a towel under both armpits helps maintain connection during your swing",
    category: "irons",
    focus: ["connection", "swing plane", "consistency"],
    difficulty: "Beginner",
    duration: "20 minutes",
    instruction1: "Place a small towel under both armpits",
    instruction2: "Take slow, smooth swings while keeping the towel in place",
    instruction3: "Focus on turning your body without losing the towels",
    common_mistake1: "Lifting arms independently of the body turn",
    common_mistake2: "Swinging too fast, causing loss of connection",
    pro_tip: "Start with half swings before progressing to full swings"
  },
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    title: "Gate Putting Drill",
    description: "Improve putting accuracy and consistency",
    overview: "Using two tees to create a gate for your putter to pass through",
    category: "putting",
    focus: ["accuracy", "putting path", "face control"],
    difficulty: "Beginner",
    duration: "15 minutes",
    instruction1: "Place two tees in the ground slightly wider than your putter head",
    instruction2: "Position your ball 2-3 feet from the hole with the tees in between",
    instruction3: "Practice putting through the gate without hitting the tees",
    instruction4: "Gradually increase distance as you improve",
    common_mistake1: "Opening or closing the putter face",
    common_mistake2: "Decelerating through impact",
    pro_tip: "Focus on a consistent tempo throughout the stroke"
  },
  {
    id: "2c3d4e5f-6g7h-8i9j-0k1l-2m3n4o5p6q",
    title: "Clock Chipping Drill",
    description: "Master distance control in your short game",
    overview: "Practice chipping to different positions around the hole like a clock face",
    category: "chipping",
    focus: ["distance control", "touch", "short game"],
    difficulty: "Intermediate",
    duration: "25 minutes",
    instruction1: "Place targets at 1, 3, 5, 7, 9 and 11 o'clock positions around a hole",
    instruction2: "From the same position, chip to each target in sequence",
    instruction3: "Focus on varying power while maintaining the same technique",
    instruction4: "Track your success rate and try to improve each round",
    common_mistake1: "Using too much wrist action",
    common_mistake2: "Inconsistent low point control",
    common_mistake3: "Deceleration through impact",
    pro_tip: "Change clubs rather than drastically changing your technique for different distances"
  },
  {
    id: "3d4e5f6g-7h8i-9j0k-1l2m-3n4o5p6q7r",
    title: "Bunker Splash Drill",
    description: "Improve sand shots with better technique",
    overview: "Practice creating the right amount of splash in bunker shots",
    category: "bunker",
    focus: ["sand play", "bunker technique", "consistency"],
    difficulty: "Advanced",
    duration: "20 minutes",
    instruction1: "Draw a line in the sand about 2 inches behind where you'd place the ball",
    instruction2: "Practice hitting 2 inches behind the line, focusing on splash",
    instruction3: "Let the club bounce through the sand rather than digging",
    instruction4: "Once comfortable, add a ball and continue the same motion",
    common_mistake1: "Hitting too close to the ball",
    common_mistake2: "Decelerating through the sand",
    common_mistake3: "Not opening the club face enough",
    pro_tip: "Open your stance and clubface more for softer landing shots"
  }
];

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

    let drillsToUse = (availableDrills && availableDrills.length > 0) ? availableDrills : sampleDrills;
    
    // Enhanced drill filtering based on specific problem
    let matchedDrills = drillsToUse;
    if (specificProblem) {
      console.log("Filtering drills for problem:", specificProblem);
      
      // Process search terms with improved tokenization
      const searchTerms = specificProblem.toLowerCase()
        .split(/[\s-]+/) // Split on spaces and hyphens
        .filter(term => term.length > 2)
        .map(term => term.replace(/[^a-z]/g, ''));
      
      console.log("Search terms:", searchTerms);
      
      // Create tiered drill selection
      const exactMatches = [];
      const relatedMatches = [];
      const possibleMatches = [];
      
      // First pass: categorize drills by relevance
      drillsToUse.forEach(drill => {
        const drillText = [
          drill.title?.toLowerCase() || '',
          drill.overview?.toLowerCase() || '',
          drill.category?.toLowerCase() || '',
          ...(drill.focus?.map(f => f.toLowerCase()) || [])
        ].join(' ');
        
        // Calculate relevance score for each drill
        const relevanceScore = getDrillRelevanceScore(drillText, searchTerms, specificProblem.toLowerCase());
        
        // Categorize based on relevance score
        if (relevanceScore > 0.7) {
          exactMatches.push({...drill, relevanceScore});
        } else if (relevanceScore > 0.4) {
          relatedMatches.push({...drill, relevanceScore});
        } else if (relevanceScore > 0.2) {
          possibleMatches.push({...drill, relevanceScore});
        }
      });
      
      console.log(`Found: ${exactMatches.length} exact matches, ${relatedMatches.length} related matches, ${possibleMatches.length} possible matches`);
      
      // Sort all categories by relevance score
      const sortByRelevance = (a, b) => b.relevanceScore - a.relevanceScore;
      exactMatches.sort(sortByRelevance);
      relatedMatches.sort(sortByRelevance);
      possibleMatches.sort(sortByRelevance);
      
      // Build final matched drills list with tiered approach
      matchedDrills = [...exactMatches];
      
      // If we don't have enough exact matches, add related matches
      if (matchedDrills.length < 6) {
        matchedDrills = [...matchedDrills, ...relatedMatches.slice(0, 6 - matchedDrills.length)];
      }
      
      // If we still don't have enough, add possible matches
      if (matchedDrills.length < 3) {
        matchedDrills = [...matchedDrills, ...possibleMatches.slice(0, 3 - matchedDrills.length)];
      }
      
      console.log(`Final matched drills: ${matchedDrills.length}`);
      
      // Ensure we have at least 3 drills or use only the matched ones if less
      if (matchedDrills.length > 0) {
        drillsToUse = matchedDrills;
      } else {
        // Only use sample drills as a last resort for backup
        console.log("No matches found, using a small subset of sample drills as fallback");
        drillsToUse = sampleDrills.slice(0, 3);
      }
    }
    
    // Simplify drill data for the prompt
    const simplifiedDrills = drillsToUse.map(drill => ({
      id: drill.id,
      title: drill.title,
      focus: drill.focus,
      category: drill.category,
      difficulty: drill.difficulty,
      overview: drill.overview?.substring(0, 100),
      relevanceScore: drill.relevanceScore || 0
    }));

    const systemPrompt = `You are a professional golf coach creating targeted practice plans. Based on the golfer's specific problem and skill level, identify root causes and select drills that directly address these issues.

You MUST respond with a valid JSON object that has exactly these fields:
1. "diagnosis": A string with an analysis of the golfer's issue
2. "rootCauses": An array of strings with root causes of the issue. Each root cause should be specific and actionable, like "closed clubface at impact" or "outside-to-in swing path"
3. "dailyPlans": An array of objects with these exact fields:
   - "day": The day number (integer, starting from 1)
   - "focus": The focus area for this day (string)
   - "duration": Estimated time required (string)
   - "drills": Array of objects with:
     - "id": The drill ID (string)
     - "sets": Number of sets (integer)
     - "reps": Number of repetitions (integer)

IMPORTANT: 
1. You MUST create EXACTLY ${planDuration} daily plans (not more, not less).
2. Each day MUST have at least 2 drills, preferably 3 if enough relevant drills are available.
3. Each day should focus on a different aspect of the problem.
4. Only select drills that specifically address the root causes you identify.
5. NEVER include drills that are unrelated to the golfer's problem. For example, don't include putting drills for a driving problem.`;

    const userPrompt = `Create a ${planDuration}-day practice plan for a ${handicapLevel} golfer working on: "${specificProblem}".
Recent performance data: ${JSON.stringify(roundData || [])}
Available drills: ${JSON.stringify(simplifiedDrills)}

YOUR RESPONSE MUST BE A VALID JSON OBJECT with diagnosis, rootCauses, and dailyPlans as described in your instructions.`;

    console.log(`Sending request to OpenAI to generate a ${planDuration}-day practice plan`);

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
        response_format: { type: "json_object" },
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
    
    let response;
    try {
      response = JSON.parse(aiResponse.choices[0].message.content);
      console.log("Successfully parsed OpenAI response");

      // Verify that the response includes the correct number of days
      const requestedDays = parseInt(planDuration);
      const generatedDays = response.dailyPlans ? response.dailyPlans.length : 0;
      
      console.log(`Requested ${requestedDays} days, generated ${generatedDays} days`);
      
      // If we don't have the correct number of days, fix it
      if (generatedDays < requestedDays) {
        console.log("Fixing insufficient day count in practice plan");
        
        // Add missing days
        for (let i = generatedDays + 1; i <= requestedDays; i++) {
          // Create a new focus area based on one of the root causes
          const focusArea = response.rootCauses[i % response.rootCauses.length] || 
                         `Day ${i} Practice`;
          
          response.dailyPlans.push({
            day: i,
            focus: `Improving ${focusArea}`,
            duration: "45 minutes",
            drills: [] // We'll fill this with drills below
          });
        }
      } else if (generatedDays > requestedDays) {
        // Trim extra days if too many were generated
        console.log("Trimming extra days from practice plan");
        response.dailyPlans = response.dailyPlans.slice(0, requestedDays);
      }
      
      // Validate each day's drills for relevance to the problem
      response.dailyPlans = response.dailyPlans.map((day, index) => {
        console.log(`Validating day ${day.day || index+1}, has ${day.drills?.length || 0} drills`);
        
        // Make sure day has a valid number
        if (!day.day) day.day = index + 1;
        
        // Create a list of valid drills for this day based on root causes & focus
        let validDrills = drillsToUse;
        if (specificProblem) {
          // Filter drills more strictly based on day's focus and root causes
          const dayCause = response.rootCauses[index % response.rootCauses.length]?.toLowerCase() || '';
          const dayFocus = day.focus?.toLowerCase() || '';
          
          validDrills = drillsToUse.filter(drill => {
            // Create a combined text representation of the drill
            const drillText = [
              drill.title?.toLowerCase() || '',
              drill.overview?.toLowerCase() || '',
              ...(drill.focus?.map(f => f.toLowerCase()) || []),
              drill.category?.toLowerCase() || ''
            ].join(' ');
            
            // Check for relevance to this day's focus or the root cause
            const relevanceScore = getDrillRelevanceScore(drillText, 
                                                         [dayCause, dayFocus], 
                                                         specificProblem.toLowerCase());
            return relevanceScore > 0.2; // Only include somewhat relevant drills
          });
          
          // Sort by relevance
          validDrills.sort((a, b) => {
            const scoreA = getDrillRelevanceScore(
              [a.title, a.overview, ...(a.focus || []), a.category].join(' ').toLowerCase(),
              [dayCause, dayFocus],
              specificProblem.toLowerCase()
            );
            const scoreB = getDrillRelevanceScore(
              [b.title, b.overview, ...(b.focus || []), b.category].join(' ').toLowerCase(),
              [dayCause, dayFocus],
              specificProblem.toLowerCase()
            );
            return scoreB - scoreA;
          });
        }
        
        // If day has insufficient drills or invalid drills, replace them
        if (!day.drills || day.drills.length < 2) {
          console.log(`Adding more relevant drills to day ${day.day}`);
          
          // Create or initialize drills array
          if (!day.drills) day.drills = [];
          
          // Get IDs of drills already in the day's plan
          const existingIds = day.drills.map(d => d.id);
          
          // Add unique drills until we have at least 2 (or all available if less than 2)
          let addedCount = 0;
          let drillIndex = 0;
          
          while (day.drills.length < 3 && addedCount < validDrills.length && drillIndex < validDrills.length) {
            const drill = validDrills[drillIndex];
            drillIndex++;
            
            // Skip if this drill is already in the day's plan
            if (existingIds.includes(drill.id)) continue;
            
            day.drills.push({
              id: drill.id,
              sets: 3,
              reps: 10
            });
            
            existingIds.push(drill.id);
            addedCount++;
          }
          
          console.log(`Day ${day.day} now has ${day.drills.length} drills`);
        }
        
        return day;
      });

    } catch (e) {
      console.error("Failed to parse OpenAI response:", e);
      throw new Error('Failed to generate practice plan');
    }

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
    
    const mappedDailyPlans = response.dailyPlans.map((day, index) => {
      const safeDay = {
        day: day.day || index + 1,
        focus: day.focus || `Golf practice day ${index + 1}`,
        duration: day.duration || "30 minutes",
        drills: Array.isArray(day.drills) ? day.drills : []
      };
      
      return {
        ...safeDay,
        drills: safeDay.drills.map(drill => {
          if (!drill || !drill.id) {
            console.warn("Skipping drill with missing ID");
            return null;
          }

          const fullDrill = drillsToUse.find(d => d.id === drill.id);
          if (!fullDrill) {
            console.warn(`Drill with ID ${drill.id} not found`);
            return null;
          }
          
          return {
            drill: fullDrill,
            sets: typeof drill.sets === 'number' ? drill.sets : 3,
            reps: typeof drill.reps === 'number' ? drill.reps : 10
          };
        }).filter(Boolean)
      };
    });

    // Make sure we don't return empty days
    const finalPlans = mappedDailyPlans.filter(day => day.drills.length > 0);
    
    if (finalPlans.length === 0) {
      console.warn("No valid drills found after mapping");
      
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

    // Final verification - if we still don't have enough days after all that
    // populate with sample drills as a last resort
    let practiceData = finalPlans;
    if (finalPlans.length < parseInt(planDuration)) {
      console.log(`Still missing days after processing! Have ${finalPlans.length}, need ${planDuration}`);
      
      // Calculate how many days we need to add
      const missingDays = parseInt(planDuration) - finalPlans.length;
      const additionalDays = [];
      
      // Get the most relevant sample drills
      const relevantSampleDrills = sampleDrills
        .map(drill => {
          const score = getDrillRelevanceScore(
            [drill.title, drill.overview, ...(drill.focus || []), drill.category].join(' ').toLowerCase(),
            specificProblem.toLowerCase().split(' '),
            specificProblem.toLowerCase()
          );
          return {...drill, relevanceScore: score};
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);
      
      for (let i = 0; i < missingDays; i++) {
        const dayNumber = finalPlans.length + i + 1;
        const dayFocus = `Additional Practice Day ${dayNumber}`;
        
        // Add a day with relevant sample drills (3 per day)
        additionalDays.push({
          day: dayNumber,
          focus: dayFocus,
          duration: "45 minutes",
          drills: relevantSampleDrills.map(drill => ({
            drill: drill,
            sets: 3,
            reps: 10
          }))
        });
      }
      
      practiceData = [...finalPlans, ...additionalDays];
      console.log(`Added ${additionalDays.length} additional days to reach ${practiceData.length} total days`);
    }

    return new Response(
      JSON.stringify({
        diagnosis: response.diagnosis || "Golf performance analysis completed",
        rootCauses: response.rootCauses || ["Technical analysis completed"],
        practicePlan: {
          plan: practiceData
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
