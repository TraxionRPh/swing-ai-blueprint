
import { ConfidencePoint } from "@/types/drill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ConfidenceChartProps {
  confidenceData: ConfidencePoint[];
  currentConfidence: number;
}

export const ConfidenceChart = ({ confidenceData, currentConfidence }: ConfidenceChartProps) => {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-primary">AI Confidence Level</CardTitle>
        <CardDescription>
          Our AI's growing understanding of your game: {currentConfidence}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={confidenceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
              />
              <Line 
                type="monotone" 
                dataKey="confidence" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ 
                  fill: 'hsl(var(--card))',
                  stroke: 'hsl(var(--primary))',
                  strokeWidth: 2,
                }}
                activeDot={{
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--card))',
                  strokeWidth: 2,
                  r: 6,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
