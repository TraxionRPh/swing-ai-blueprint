
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface ScoreData {
  date: string;
  score: number;
  courseName: string;
}

export const ScoreChart = () => {
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRounds = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('rounds')
          .select(`
            total_score,
            date,
            golf_courses (
              name
            )
          `)
          .eq('user_id', user.id)
          .is('total_score', 'not.null')
          .order('date', { ascending: true })
          .limit(6);

        if (error) {
          console.error('Error fetching rounds:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const formattedData = data.map(round => ({
            date: format(new Date(round.date), 'MMM d'),
            score: round.total_score,
            courseName: round.golf_courses?.name || 'Unknown Course'
          }));
          setScoreData(formattedData);
        }
      } catch (err) {
        console.error('Error in score chart:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
  }, [user]);

  const fallbackData = [
    { date: 'Jan 15', score: 92 },
    { date: 'Jan 29', score: 89 },
    { date: 'Feb 12', score: 87 },
    { date: 'Feb 26', score: 90 },
    { date: 'Mar 10', score: 85 },
    { date: 'Mar 24', score: 83 },
  ];

  // Use the fetched data if available, otherwise use fallback data for new users
  const displayData = scoreData.length > 0 ? scoreData : fallbackData;

  // Calculate the min and max values for domain
  const scores = displayData.map(item => item.score);
  const minScore = Math.min(...scores) - 3; // Add some padding
  const maxScore = Math.max(...scores) + 3;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Recent Scores</CardTitle>
        <CardDescription>Your last {displayData.length} rounds</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[minScore, maxScore]} reversed />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'score') return [`${value}`, 'Score'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const dataPoint = displayData.find(item => item.date === label);
                return dataPoint?.courseName ? `${label} - ${dataPoint.courseName}` : label;
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#FFC300"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
