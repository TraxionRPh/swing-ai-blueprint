
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const scoreData = [
  { date: 'Jan 15', score: 92 },
  { date: 'Jan 29', score: 89 },
  { date: 'Feb 12', score: 87 },
  { date: 'Feb 26', score: 90 },
  { date: 'Mar 10', score: 85 },
  { date: 'Mar 24', score: 83 },
];

export const ScoreChart = () => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Recent Scores</CardTitle>
        <CardDescription>Your last 6 rounds</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={scoreData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} reversed />
            <Tooltip />
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
