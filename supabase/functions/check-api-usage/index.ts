
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

// Define limits per type of AI feature
const DAILY_LIMITS = {
  ai_analysis: 5,
  practice_plan: 5
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

    // Get today's date in YYYY-MM-DD format for daily limit tracking
    const today = new Date().toISOString().split('T')[0];
    
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

    // Check user's API usage for today
    const { data: usageData, error: usageError } = await supabase
      .from('api_usage')
      .select('count')
      .eq('user_id', user_id)
      .eq('type', type)
      .eq('date', today)
      .single();

    const currentUsage = usageData?.count || 0;
    const dailyLimit = DAILY_LIMITS[type as keyof typeof DAILY_LIMITS] || 3;
    
    if (currentUsage >= dailyLimit) {
      // User has reached their limit
      return new Response(
        JSON.stringify({ 
          success: false, 
          limitReached: true,
          message: `You've reached your daily limit of ${dailyLimit} ${type} requests. Upgrade to premium for unlimited access.`,
          currentUsage,
          dailyLimit
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment usage count
    if (usageData) {
      // Update existing record
      await supabase
        .from('api_usage')
        .update({ count: currentUsage + 1 })
        .eq('user_id', user_id)
        .eq('type', type)
        .eq('date', today);
    } else {
      // Create new record
      await supabase
        .from('api_usage')
        .insert([{ 
          user_id, 
          type, 
          date: today, 
          count: 1 
        }]);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "API usage allowed", 
        currentUsage: currentUsage + 1,
        dailyLimit
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
