
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching notifications",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error: any) {
      toast({
        title: "Error marking notification as read",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const subscribeToNotifications = async () => {
    if (!user) return;

    // Request push notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Register service worker and subscribe to push notifications
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // You'll need to set this up
          });

          // Convert ArrayBuffer to base64 string for storage
          const p256dhKey = subscription.getKey('p256dh');
          const authKey = subscription.getKey('auth');
          
          const authKeysForStorage = {
            p256dh: p256dhKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(p256dhKey))) : '',
            auth: authKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(authKey))) : ''
          };

          // Store subscription in Supabase
          const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
              user_id: user.id,
              endpoint: subscription.endpoint,
              auth_keys: authKeysForStorage
            });

          if (error) throw error;
        } catch (error: any) {
          console.error('Error subscribing to push notifications:', error);
        }
      }
    }

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          
          toast({
            title: payload.new.title,
            description: payload.new.body,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    fetchNotifications();
    const unsubscribePromise = subscribeToNotifications();
    
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [user]);

  return { notifications, loading, markAsRead };
};
