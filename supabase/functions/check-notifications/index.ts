
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async () => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check for incomplete rounds
    const { data: incompleteRounds } = await supabaseAdmin
      .from('rounds')
      .select('user_id')
      .is('total_score', null)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Send notifications for incomplete rounds
    for (const round of (incompleteRounds || [])) {
      const { data: userPrefs } = await supabaseAdmin
        .from('notification_preferences')
        .select('round_completion_reminders')
        .eq('user_id', round.user_id)
        .single();

      if (userPrefs?.round_completion_reminders) {
        await supabaseAdmin.from('notifications').insert({
          user_id: round.user_id,
          title: 'Complete Your Round',
          body: 'You have an incomplete round from the last 24 hours. Would you like to finish it?',
          type: 'round_completion',
          data: { roundId: round.id }
        });
      }
    }

    // Send practice reminders (every 3 days if no activity)
    const { data: users } = await supabaseAdmin
      .from('profiles')
      .select('id');

    for (const user of (users || [])) {
      const { data: recentActivity } = await supabaseAdmin
        .from('rounds')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const lastActivity = recentActivity?.created_at 
        ? new Date(recentActivity.created_at)
        : null;

      if (!lastActivity || (Date.now() - lastActivity.getTime() > 3 * 24 * 60 * 60 * 1000)) {
        const { data: userPrefs } = await supabaseAdmin
          .from('notification_preferences')
          .select('practice_reminders')
          .eq('user_id', user.id)
          .single();

        if (userPrefs?.practice_reminders) {
          await supabaseAdmin.from('notifications').insert({
            user_id: user.id,
            title: 'Time to Practice',
            body: 'Keep your golf game sharp! It\'s been a while since your last practice session.',
            type: 'practice_reminder'
          });
        }
      }
    }

    return new Response(JSON.stringify({ status: 'Notifications checked and sent' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in notification checker:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
