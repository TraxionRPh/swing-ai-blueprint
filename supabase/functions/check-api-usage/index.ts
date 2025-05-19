
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables");
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// Define limits per type of AI feature - now for rolling 24 hour window
const HOURLY_LIMITS = {
  ai_analysis: 10,
  practice_plan: 10
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
        JSON.stringify({ success: false, error: "User ID is required", limitReached: true }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user has premium subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('is_premium')
      .eq('user_id', user_id)
      .single();
      
    if (!subscriptionError && subscriptionData?.is_premium) {
      // Premium users have unlimited access
      return new Response(
        JSON.stringify({ success: true, message: "Premium user - unlimited access" }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const timestampLowerBound = twentyFourHoursAgo.toISOString();
    
    // Get usage from the last 24 hours
    const { data: usageData, error: usageError } = await supabase
      .from('api_usage')
      .select('count, created_at')
      .eq('user_id', user_id)
      .eq('type', type)
      .gte('created_at', timestampLowerBound);

    if (usageError) {
      console.error("Error fetching usage data:", usageError);
    }
      
    // Calculate total usage in the last 24 hours
    const currentUsage = usageData ? usageData.reduce((total, record) => total + record.count, 0) : 0;
    const hourlyLimit = HOURLY_LIMITS[type as keyof typeof HOURLY_LIMITS] || 5;
    
    if (currentUsage >= hourlyLimit) {
      // User has reached their limit
      return new Response(
        JSON.stringify({ 
          success: false, 
          limitReached: true,
          message: `You've reached your limit of ${hourlyLimit} ${type} requests in a 24-hour period. Upgrade to premium for unlimited access.`,
          currentUsage,
          dailyLimit: hourlyLimit
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new usage record
    const { data: insertData, error: insertError } = await supabase
      .from('api_usage')
      .insert([{ 
        user_id, 
        type, 
        count: 1,
        created_at: new Date().toISOString() // Store the exact timestamp
      }]);
      
    if (insertError) {
      console.error("Error inserting usage data:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "API usage allowed", 
        currentUsage: currentUsage + 1,
        dailyLimit: hourlyLimit
      }),
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
