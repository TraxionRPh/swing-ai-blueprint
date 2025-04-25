
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAILY_API_CALL_LIMIT = 5;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, type } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User ID is required' 
        }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user has available API calls
    const { data: usageCheckData, error: usageCheckError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/check_api_usage`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ 
          user_id, 
          daily_limit: DAILY_API_CALL_LIMIT 
        })
      }
    ).then(res => res.json());

    // If usage check failed or limit exceeded
    if (usageCheckError || usageCheckData === false) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Daily API call limit exceeded',
          limit: DAILY_API_CALL_LIMIT
        }), 
        { 
          status: 429, // Too Many Requests
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If check passes, increment usage
    const { error: incrementError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/increment_api_usage`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ user_id })
      }
    );

    if (incrementError) {
      console.error('Failed to increment API usage:', incrementError);
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        remainingCalls: DAILY_API_CALL_LIMIT - (usageCheckData.call_count + 1) 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in API usage check:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
