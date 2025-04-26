
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { generateAnalysis } from "./openai.ts";
import { generatePrompt } from "./prompt.ts";
import { savePracticePlan } from "./database.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { userId, roundData, handicapLevel, goals, specificProblem, planDuration } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // If this is a full AI analysis request (not just for a practice plan)
    if (!specificProblem && !planDuration) {
      try {
        // Connect to Supabase to get real user data
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        
        // Fetch user's rounds data
        const roundsResponse = await fetch(`${supabaseUrl}/rest/v1/rounds?user_id=eq.${userId}&order=date.desc&limit=10`, {
          headers: {
            'Content-Type': 'application/json',
            'Apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        const rounds = await roundsResponse.json();
        
        // Fetch hole scores for those rounds
        const roundIds = rounds.map((r: any) => r.id).join(',');
        let holeScores = [];
        
        if (roundIds.length > 0) {
          const scoresResponse = await fetch(`${supabaseUrl}/rest/v1/hole_scores?round_id=in.(${roundIds})`, {
            headers: {
              'Content-Type': 'application/json',
              'Apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          
          holeScores = await scoresResponse.json();
        }
        
        // Fetch user's practice plans history
        const plansResponse = await fetch(`${supabaseUrl}/rest/v1/ai_practice_plans?user_id=eq.${userId}&order=created_at.desc&limit=5`, {
          headers: {
            'Content-Type': 'application/json',
            'Apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        const practicePlans = await plansResponse.json();
        
        // Fetch user profile to get handicap and goals
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        const profiles = await profileResponse.json();
        const profile = profiles.length > 0 ? profiles[0] : null;
        
        // Process the collected data
        const analysisData = processGolferData(rounds, holeScores, practicePlans, profile);
        
        // Generate analysis based on real data
        const prompt = `
          Based on the following real golfer data, provide a complete analysis of their performance:
          
          Rounds Data: ${JSON.stringify(analysisData.roundStats)}
          Common Issues: ${JSON.stringify(analysisData.commonIssues)}
          Skill Ratings: ${JSON.stringify(analysisData.skillRatings)}
          Improvement Areas: ${JSON.stringify(analysisData.improvementAreas)}
          
          Provide a structured analysis in JSON format with the following fields:
          1. performanceAnalysis (object with driving, ironPlay, chipping, bunker, and putting scores on a scale of 1-100)
          2. aiConfidence (number from 1-100 representing confidence in the analysis)
          3. identifiedIssues (array of objects with area, description, and priority fields)
          4. recommendedPractice (object with weeklyFocus, primaryDrill, secondaryDrill, and weeklyAssignment)
        `;
        
        const analysisText = await generateAnalysis(prompt, OPENAI_API_KEY);
        
        try {
          console.log('Raw analysis text:', analysisText);
          
          // Parse the response as JSON
          const analysisResult = JSON.parse(analysisText);
          
          // Save to database
          try {
            await savePracticePlan(
              userId,
              "Golf performance analysis",
              null,
              analysisResult,
              supabaseUrl,
              supabaseKey
            );
          } catch (dbError) {
            console.error('Failed to save to database:', dbError);
          }

          return new Response(JSON.stringify({
            success: true,
            analysis: analysisResult
          }), {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            }
          });
          
        } catch (error) {
          console.error('Error parsing OpenAI response:', error);
          console.error('Problematic response:', analysisText);
          return new Response(JSON.stringify({ 
            success: false,
            error: `Error parsing OpenAI response: ${error.message}`,
            rawResponse: analysisText 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (dataError) {
        console.error('Error fetching or processing user data:', dataError);
        return new Response(
          JSON.stringify({ error: `Error processing user data: ${dataError.message}` }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Original practice plan generation code for when specificProblem or planDuration is provided
    // Generate the prompt with plan duration
    const prompt = generatePrompt({ userId, roundData, handicapLevel, goals, specificProblem, planDuration });
    console.log('Generated prompt:', prompt);

    // Get analysis from OpenAI
    const analysisText = await generateAnalysis(prompt, OPENAI_API_KEY);
    
    // Parse the JSON response from OpenAI
    let analysisData;
    let practicePlanData = null;
    try {
      console.log('Raw analysis text:', analysisText);
      
      // Try to parse the response as JSON
      analysisData = JSON.parse(analysisText);
      
      if ((specificProblem || planDuration) && analysisData.problem) {
        practicePlanData = analysisData;
        
        // Ensure the practice plan has the right number of sessions based on planDuration
        if (planDuration && practicePlanData.practicePlan && practicePlanData.practicePlan.sessions) {
          const days = parseInt(planDuration) || 1;
          // If we have fewer sessions than requested days, add more
          while (practicePlanData.practicePlan.sessions.length < days) {
            const dayNum = practicePlanData.practicePlan.sessions.length + 1;
            practicePlanData.practicePlan.sessions.push({
              focus: `Day ${dayNum} Practice`,
              drills: practicePlanData.recommendedDrills.slice(0, 2).map(d => d.name),
              duration: "45 minutes"
            });
          }
          
          // If we have more sessions than requested days, trim the list
          if (practicePlanData.practicePlan.sessions.length > days) {
            practicePlanData.practicePlan.sessions = practicePlanData.practicePlan.sessions.slice(0, days);
          }
        }
      }

      // Save to database
      try {
        await savePracticePlan(
          userId,
          specificProblem,
          practicePlanData,
          analysisData,
          Deno.env.get('SUPABASE_URL') || '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
        // Continue execution even if saving fails, to at least return the analysis
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
      console.error('Error parsing OpenAI response:', error);
      console.error('Problematic response:', analysisText);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Error parsing OpenAI response: ${error.message}`,
        rawResponse: analysisText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
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

// Helper function to process golfer data into meaningful insights
function processGolferData(rounds: any[], holeScores: any[], practicePlans: any[], profile: any) {
  const roundStats = {
    averageScore: 0,
    fairwayHitPercentage: 0,
    girPercentage: 0,
    averagePutts: 0,
    roundsPlayed: rounds.length
  };
  
  const skillRatings = {
    driving: 0,
    approach: 0,
    shortGame: 0,
    putting: 0,
    bunker: 0
  };
  
  const commonIssues = [];
  const improvementAreas = [];
  
  // Calculate round statistics
  if (rounds.length > 0) {
    let totalScore = 0;
    let totalPutts = 0;
    let totalFairways = 0;
    let totalGIR = 0;
    let totalHoles = 0;
    
    rounds.forEach(round => {
      if (round.total_score) totalScore += round.total_score;
      if (round.total_putts) totalPutts += round.total_putts;
      if (round.fairways_hit) totalFairways += round.fairways_hit;
      if (round.greens_in_regulation) totalGIR += round.greens_in_regulation;
      if (round.hole_count) totalHoles += round.hole_count;
    });
    
    roundStats.averageScore = totalScore / rounds.length;
    roundStats.averagePutts = totalPutts / rounds.length;
    roundStats.fairwayHitPercentage = (totalFairways / totalHoles) * 100;
    roundStats.girPercentage = (totalGIR / totalHoles) * 100;
    
    // Analyze hole scores for deeper insights
    if (holeScores.length > 0) {
      // Find patterns in hole scores (e.g., struggling on par 3s, etc.)
      const parPerformance = {
        par3: { total: 0, overPar: 0 },
        par4: { total: 0, overPar: 0 },
        par5: { total: 0, overPar: 0 }
      };
      
      // This is simplified, in a real implementation we would need to know the par for each hole
      // Here we're making assumptions about hole numbers and pars
      holeScores.forEach(score => {
        // This is a simplification - ideally we'd have the actual par value for each hole
        // This just gives us some data to work with
        if (score.hole_number % 3 === 0) {
          parPerformance.par3.total++;
          if (score.score > 3) parPerformance.par3.overPar++;
        } else if (score.hole_number % 3 === 1) {
          parPerformance.par4.total++;
          if (score.score > 4) parPerformance.par4.overPar++;
        } else {
          parPerformance.par5.total++;
          if (score.score > 5) parPerformance.par5.overPar++;
        }
      });
      
      // Set skill ratings based on statistics
      skillRatings.driving = Math.round(roundStats.fairwayHitPercentage);
      skillRatings.approach = Math.round(roundStats.girPercentage);
      skillRatings.putting = Math.max(0, Math.min(100, 100 - ((roundStats.averagePutts - 1.5) * 20)));
      
      // Identify common issues
      if (roundStats.fairwayHitPercentage < 50) {
        commonIssues.push({
          area: "Driver Path",
          description: "Low fairway hit percentage indicates issues with driver accuracy.",
          priority: "High"
        });
      }
      
      if (roundStats.girPercentage < 40) {
        commonIssues.push({
          area: "Iron Play",
          description: "Green in regulation percentage is below average, suggesting approach shot issues.",
          priority: "Medium"
        });
      }
      
      if (roundStats.averagePutts > 2) {
        commonIssues.push({
          area: "Putting",
          description: "Average putts per hole is higher than ideal, indicating putting inconsistency.",
          priority: "Low"
        });
      }
      
      // Identify improvement areas
      const par3Percentage = parPerformance.par3.total > 0 ? 
        (parPerformance.par3.overPar / parPerformance.par3.total) * 100 : 0;
      
      if (par3Percentage > 60) {
        improvementAreas.push("Short iron accuracy");
      }
      
      if (parPerformance.par5.total > 0 && 
          (parPerformance.par5.overPar / parPerformance.par5.total) * 100 > 70) {
        improvementAreas.push("Long game strategy");
      }
    }
  }
  
  return {
    roundStats,
    skillRatings,
    commonIssues,
    improvementAreas
  };
}
