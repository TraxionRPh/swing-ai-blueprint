
import { DrillData, AIResponse } from './types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export class ResponseHandler {
  static createSuccessResponse(
    response: AIResponse,
    drills: DrillData[],
    planDuration: string
  ): Response {
    const mappedPlans = response.practicePlan.plan.map((day, index) => ({
      ...day,
      drills: day.drills.map(drill => {
        const fullDrill = drills.find(d => d.id === drill.id);
        if (!fullDrill) return null;
        
        return {
          drill: fullDrill,
          sets: typeof drill.sets === 'number' ? drill.sets : 3,
          reps: typeof drill.reps === 'number' ? drill.reps : 10
        };
      }).filter(Boolean)
    }));

    return new Response(
      JSON.stringify({
        diagnosis: response.diagnosis,
        rootCauses: response.rootCauses,
        practicePlan: {
          plan: mappedPlans,
          challenge: response.practicePlan.challenge
        }
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
