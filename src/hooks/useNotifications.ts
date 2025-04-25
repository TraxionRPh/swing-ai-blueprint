
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreferences {
  practice_reminders: boolean;
  round_completion_reminders: boolean;
  ai_insights: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  data: any;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    practice_reminders: true,
    round_completion_reminders: true,
    ai_insights: true
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    setupRealtimeSubscription();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setPreferences({
          practice_reminders: data.practice_reminders,
          round_completion_reminders: data.round_completion_reminders,
          ai_insights: data.ai_insights
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(newPreferences)
        .not('id', 'is', null);

      if (error) throw error;
      
      setPreferences(prev => ({ ...prev, ...newPreferences }));
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
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
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
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

  return {
    notifications,
    preferences,
    loading,
    updatePreferences,
    markAsRead
  };
};
