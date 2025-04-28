import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { ScoreChartTooltip } from "./ScoreChartTooltip";

interface ScoreData {
  date: string;
  score: number;
  courseName: string;
  totalPar: number;
  location: string;
}

export const ScoreChart = () => {
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRounds = async () => {
      if (!user) return;

      try {
        console.log("Fetching rounds for user:", user.id);
        
        const { data, error } = await supabase
          .from('rounds')
          .select(`
            total_score,
            date,
            golf_courses (
              name,
              total_par,
              city,
              state
            )
          `)
          .eq('user_id', user.id)
          .not('total_score', 'is', null)
          .order('date', { ascending: true })
          .limit(6);

        if (error) {
          console.error('Error fetching rounds:', error);
          setError(error.message);
          setLoading(false);
          return;
        }

        console.log("Rounds data received:", data);

        if (data && data.length > 0) {
          const formattedData = data.map(round => ({
            date: format(new Date(round.date), 'MMM d'),
            score: round.total_score,
            courseName: round.golf_courses?.name || 'Unknown Course',
            totalPar: round.golf_courses?.total_par || 72,
            location: `${round.golf_courses?.city || ''}, ${round.golf_courses?.state || ''}`
          }));
          console.log("Formatted data:", formattedData);
          setScoreData(formattedData);
        }
      } catch (err) {
        console.error('Error in score chart:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
  }, [user]);

  const fallbackData: ScoreData[] = [
    { date: 'Jan 15', score: 92, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST' },
    { date: 'Jan 29', score: 89, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST' },
    { date: 'Feb 12', score: 87, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST' },
    { date: 'Feb 26', score: 90, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST' },
    { date: 'Mar 10', score: 85, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST' },
    { date: 'Mar 24', score: 83, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST' },
  ];

  const displayData = scoreData.length > 0 ? scoreData : fallbackData;
  const scores = displayData.map(item => item.score);
  const minScore = Math.min(...scores) - 3;
  const maxScore = Math.max(...scores) + 3;

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle>Recent Scores</CardTitle>
        <CardDescription>
          Your last {scoreData.length > 0 ? scoreData.length : fallbackData.length} rounds
          {error && <span className="text-red-500 ml-2 text-xs">({error})</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading scores...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[minScore, maxScore]} reversed />
              <Tooltip content={<ScoreChartTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 0 }}
                activeDot={{ r: 8, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
