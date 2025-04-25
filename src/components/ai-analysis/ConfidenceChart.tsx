
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const confidenceData = [
  { month: 'Jan', confidence: 35 },
  { month: 'Feb', confidence: 42 },
  { month: 'Mar', confidence: 48 },
  { month: 'Apr', confidence: 55 },
];

export const ConfidenceChart = () => {
  const isMobile = useIsMobile();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Confidence Score</CardTitle>
        <CardDescription>
          Your game confidence based on performance trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Current Score</p>
              <p className="text-2xl md:text-3xl font-bold">55</p>
            </div>
            <div className="text-sm text-muted-foreground">
              +7 pts from last month
            </div>
          </div>
          <Progress value={55} className="h-2" />
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#888', fontSize: isMobile ? 10 : 12 }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#888', fontSize: isMobile ? 10 : 12 }}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(24, 24, 27, 0.9)',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#FCA311"
                  strokeWidth={2}
                  dot={{ r: isMobile ? 3 : 4 }}
                  activeDot={{ r: isMobile ? 6 : 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
