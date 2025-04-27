
import { AIResponse } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export class ResponseHandler {
  static createSuccessResponse(
    response: AIResponse,
    availableDrills: any[] = [],
    planDuration: string = '1',
    userData?: any,
    isAIGenerated: boolean = false
  ): Response {
    let responseBody = {
      diagnosis: response.diagnosis,
      rootCauses: response.rootCauses,
      practicePlan: response.practicePlan,
      isAIGenerated: isAIGenerated
    };

    // Add performance insights if they exist
    if (response.performanceInsights && response.performanceInsights.length > 0) {
      responseBody = {
        ...responseBody,
        performanceInsights: response.performanceInsights
      };
    }

    // Add user goals if they exist in the user data
    if (userData?.selected_goals && userData.selected_goals.length > 0) {
      responseBody = {
        ...responseBody,
        userGoals: {
          selectedGoals: userData.selected_goals,
          scoreGoal: userData.score_goal,
          handicapGoal: userData.handicap_goal
        }
      };
    }

    // Check if there's any challenge in the response and log if not
    if (!response.practicePlan.challenge) {
      console.error("No challenge in response");
    }

    return new Response(
      JSON.stringify(responseBody),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  static createErrorResponse(error: any): Response {
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
