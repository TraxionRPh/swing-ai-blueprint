
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
  totalPar: number;
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
              name,
              total_par
            )
          `)
          .eq('user_id', user.id)
          .not('total_score', 'is', null)
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
            courseName: round.golf_courses?.name || 'Unknown Course',
            totalPar: round.golf_courses?.total_par || 72
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

  const fallbackData: ScoreData[] = [
    { date: 'Jan 15', score: 92, courseName: 'Sample Course', totalPar: 72 },
    { date: 'Jan 29', score: 89, courseName: 'Sample Course', totalPar: 72 },
    { date: 'Feb 12', score: 87, courseName: 'Sample Course', totalPar: 72 },
    { date: 'Feb 26', score: 90, courseName: 'Sample Course', totalPar: 72 },
    { date: 'Mar 10', score: 85, courseName: 'Sample Course', totalPar: 72 },
    { date: 'Mar 24', score: 83, courseName: 'Sample Course', totalPar: 72 },
  ];

  const displayData = scoreData.length > 0 ? scoreData : fallbackData;
  const scores = displayData.map(item => item.score);
  const minScore = Math.min(...scores) - 3;
  const maxScore = Math.max(...scores) + 3;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Recent Scores</CardTitle>
        <CardDescription>
          Your last {displayData.length} rounds
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[minScore, maxScore]} reversed />
            <Tooltip 
              formatter={(value, name) => {
                const dataPoint = displayData.find(item => item.score === value);
                if (name === 'score' && dataPoint) {
                  const overUnder = dataPoint.score - dataPoint.totalPar;
                  const overUnderText = overUnder === 0 ? 'E' : overUnder > 0 ? `+${overUnder}` : overUnder;
                  return [`${value} (${overUnderText})`, 'Score'];
                }
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
