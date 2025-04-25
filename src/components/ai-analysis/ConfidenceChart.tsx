
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

const aiConfidenceData = [
  { month: 'Jan', confidence: 65 },
  { month: 'Feb', confidence: 72 },
  { month: 'Mar', confidence: 78 },
  { month: 'Apr', confidence: 85 },
];

export const ConfidenceChart = () => {
  const isMobile = useIsMobile();
  const latestConfidence = aiConfidenceData[aiConfidenceData.length - 1].confidence;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">AI Analysis Confidence</CardTitle>
        <CardDescription>
          AI's confidence in the accuracy of its performance analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Current Confidence</p>
              <p className="text-2xl md:text-3xl font-bold">{latestConfidence}%</p>
            </div>
            <div className="text-sm text-muted-foreground">
              +7% improvement from last month
            </div>
          </div>
          <Progress value={latestConfidence} className="h-2" />
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiConfidenceData}>
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
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(24, 24, 27, 0.9)',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: isMobile ? '12px' : '14px'
                  }}
                  formatter={(value) => [`${value}%`, 'Confidence']}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#10B981" // A green color to represent increasing confidence
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

