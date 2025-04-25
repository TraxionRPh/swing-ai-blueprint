
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { title, body, userId, data } = await req.json()

    if (!title || !body || !userId) {
      throw new Error('Missing required fields')
    }

    // Store notification in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        data: data || {},
      })

    if (notificationError) throw notificationError

    // Get user's push subscriptions
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (subscriptionError) throw subscriptionError

    // Send push notification to all subscribed devices
    const pushPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: atob(subscription.auth_keys.p256dh),
            auth: atob(subscription.auth_keys.auth)
          }
        }
  
        const payload = JSON.stringify({
          title,
          body,
          data
        })
  
        // In a production environment, you would use web-push library
        // Here we'll just log it for demo purposes
        console.log('Sending push notification:', {
          subscription: pushSubscription,
          payload
        })
      } catch (error) {
        console.error('Error sending push notification:', error)
      }
    })

    await Promise.all(pushPromises)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
