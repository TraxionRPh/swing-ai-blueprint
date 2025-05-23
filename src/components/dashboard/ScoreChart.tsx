
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { ScoreChartTooltip } from "./ScoreChartTooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface ScoreData {
  date: string;
  score: number;
  courseName: string;
  totalPar: number;
  location: string;
  holeCount: number;
}

export const ScoreChart = () => {
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("18");
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
            hole_count,
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
          .limit(12);

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
            location: `${round.golf_courses?.city || ''}, ${round.golf_courses?.state || ''}`,
            holeCount: round.hole_count || 18
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

  const fallbackData9Holes: ScoreData[] = [
    { date: 'Jan 15', score: 46, courseName: 'Sample Course', totalPar: 36, location: 'Sample, ST', holeCount: 9 },
    { date: 'Jan 29', score: 44, courseName: 'Sample Course', totalPar: 36, location: 'Sample, ST', holeCount: 9 },
    { date: 'Feb 12', score: 43, courseName: 'Sample Course', totalPar: 36, location: 'Sample, ST', holeCount: 9 },
    { date: 'Feb 26', score: 45, courseName: 'Sample Course', totalPar: 36, location: 'Sample, ST', holeCount: 9 },
    { date: 'Mar 10', score: 42, courseName: 'Sample Course', totalPar: 36, location: 'Sample, ST', holeCount: 9 },
    { date: 'Mar 24', score: 41, courseName: 'Sample Course', totalPar: 36, location: 'Sample, ST', holeCount: 9 },
  ];

  const fallbackData18Holes: ScoreData[] = [
    { date: 'Jan 15', score: 92, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
    { date: 'Jan 29', score: 89, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
    { date: 'Feb 12', score: 87, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
    { date: 'Feb 26', score: 90, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
    { date: 'Mar 10', score: 85, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
    { date: 'Mar 24', score: 83, courseName: 'Sample Course', totalPar: 72, location: 'Sample, ST', holeCount: 18 },
  ];

  const nineHoleScores = scoreData.filter(round => round.holeCount === 9);
  const eighteenHoleScores = scoreData.filter(round => round.holeCount === 18);
  
  const displayData9Holes = nineHoleScores.length > 0 ? nineHoleScores : fallbackData9Holes;
  const displayData18Holes = eighteenHoleScores.length > 0 ? eighteenHoleScores : fallbackData18Holes;

  const getChartData = () => {
    return activeTab === "9" ? displayData9Holes : displayData18Holes;
  };
  
  const currentData = getChartData();
  const scores = currentData.map(item => item.score);
  const minScore = scores.length > 0 ? Math.min(...scores) - 3 : 30;
  const maxScore = scores.length > 0 ? Math.max(...scores) + 3 : 100;

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle>Recent Scores</CardTitle>
        <CardDescription>
          Your last {currentData.length} rounds
          {error && <span className="text-red-500 ml-2 text-xs">({error})</span>}
        </CardDescription>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="18">18 Holes</TabsTrigger>
            <TabsTrigger value="9">9 Holes</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading scores...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData}>
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
