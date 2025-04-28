
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';

export const useGolfStats = () => {
  const { user } = useAuth();
  const [handicap, setHandicap] = useState<number | null>(null);
  const [bestRound, setBestRound] = useState<number | null>(null);
  const [practiceTime, setPracticeTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch handicap
        const { data: handicapData } = await supabase
          .rpc('calculate_user_handicap', { user_uuid: user.id });
        setHandicap(handicapData);

        // Fetch best round from last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const { data: roundData } = await supabase
          .from('rounds')
          .select('total_score')
          .eq('user_id', user.id)
          .gte('date', ninetyDaysAgo.toISOString())
          .order('total_score', { ascending: true })
          .limit(1);

        if (roundData && roundData.length > 0) {
          setBestRound(roundData[0].total_score);
        }

        // Fetch practice time for current month
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());

        const { data: practiceData } = await supabase
          .from('practice_sessions')
          .select('duration_minutes')
          .eq('user_id', user.id)
          .gte('date', monthStart.toISOString())
          .lte('date', monthEnd.toISOString());

        if (practiceData) {
          const totalMinutes = practiceData.reduce((sum, session) => 
            sum + session.duration_minutes, 0);
          setPracticeTime(Math.round(totalMinutes / 60)); // Convert to hours
        }
      } catch (error) {
        console.error('Error fetching golf stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { handicap, bestRound, practiceTime, loading };
};
