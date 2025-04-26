
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { user_id, type } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, let's always allow API usage since this is just returning errors
    // In a production app, you would implement proper API usage limits here

    return new Response(
      JSON.stringify({ success: true, message: "API usage allowed" }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error checking API usage:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
