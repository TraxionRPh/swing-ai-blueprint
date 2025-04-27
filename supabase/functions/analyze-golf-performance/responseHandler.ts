
import { DrillData, AIResponse } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export class ResponseHandler {
  static createSuccessResponse(
    response: AIResponse,
    drills: DrillData[],
    planDuration: string,
    userData?: any
  ): Response {
    // Make sure challenge has proper attempts field
    if (response.practicePlan.challenge) {
      const challenge = response.practicePlan.challenge;
      if (!challenge.attempts) {
        const instructionCount = [
          challenge.instruction1, 
          challenge.instruction2, 
          challenge.instruction3
        ].filter(Boolean).length;
        
        challenge.attempts = instructionCount > 0 ? instructionCount * 3 : 9;
      }
      
      console.log("Challenge included in response:", challenge.title);
    } else {
      console.warn("No challenge in response");
    }

    // Handle the case when there are no drills
    const mappedPlans = response.practicePlan.plan.map((day, index) => {
      // If day has no drills, return the day with an empty drills array
      if (!day.drills || day.drills.length === 0) {
        return {
          ...day,
          drills: []
        };
      }
      
      return {
        ...day,
        drills: day.drills
          .filter(drill => {
            // Filter out any drills that might be challenges
            if (typeof drill.id === 'string' && drill.id.includes('challenge')) {
              return false;
            }
            
            // Filter out null or undefined drill IDs
            if (!drill.id) {
              console.warn(`Found drill with missing ID in day ${index + 1}`);
              return false;
            }
            
            return true;
          })
          .map(drill => {
            const fullDrill = drills.find(d => d.id === drill.id);
            if (!fullDrill) {
              console.warn(`Could not find full drill for ID: ${drill.id}`);
              return null;
            }
            
            return {
              drill: fullDrill,
              sets: typeof drill.sets === 'number' ? drill.sets : 3,
              reps: typeof drill.reps === 'number' ? drill.reps : 10
            };
          })
          .filter(Boolean)
      };
    });

    // Include user's goals and metrics in the response if available
    let userGoals = null;
    if (userData) {
      userGoals = {
        scoreGoal: userData.score_goal,
        handicapGoal: userData.handicap_goal,
        selectedGoals: userData.selected_goals || [],
        currentHandicapLevel: userData.handicap_level
      };
    }

    // Add performance insights based on rounds and challenges if available
    const performanceInsights = response.performanceInsights || [];

    return new Response(
      JSON.stringify({
        diagnosis: response.diagnosis,
        rootCauses: response.rootCauses,
        practicePlan: {
          plan: mappedPlans,
          challenge: response.practicePlan.challenge
        },
        userGoals,
        performanceInsights
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  static createErrorResponse(error: Error): Response {
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
}
