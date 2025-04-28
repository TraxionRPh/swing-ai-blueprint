
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { startOfMonth, endOfMonth } from "date-fns";

interface PracticeData {
  name: string;
  hours: number;
}

export const PracticeChart = () => {
  const [practiceData, setPracticeData] = useState<PracticeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPracticeData = async () => {
      if (!user) return;

      try {
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());

        const { data, error } = await supabase
          .from('practice_sessions')
          .select('focus_area, duration_minutes')
          .eq('user_id', user.id)
          .gte('date', monthStart.toISOString())
          .lte('date', monthEnd.toISOString());

        if (error) throw error;

        // Aggregate practice time by focus area
        const practiceByArea = data.reduce((acc, session) => {
          const hours = session.duration_minutes / 60;
          acc[session.focus_area] = (acc[session.focus_area] || 0) + hours;
          return acc;
        }, {} as Record<string, number>);

        // Convert to chart data format
        const formattedData = Object.entries(practiceByArea).map(([name, hours]) => ({
          name,
          hours: Math.round(hours),
        }));

        setPracticeData(formattedData);
      } catch (error) {
        console.error('Error fetching practice data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeData();
  }, [user]);

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle>Practice Focus</CardTitle>
        <CardDescription>Hours spent by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading practice data...</p>
          </div>
        ) : practiceData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={practiceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No practice data recorded this month</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
