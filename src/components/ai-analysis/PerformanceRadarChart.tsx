
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PerformanceData {
  driving: number;
  ironPlay: number;
  chipping: number;
  bunker: number;
  putting: number;
}

interface PerformanceRadarChartProps {
  data?: PerformanceData;
  isPlaceholder?: boolean;
}

export const PerformanceRadarChart = ({ data, isPlaceholder = false }: PerformanceRadarChartProps) => {
  const isMobile = useIsMobile();

  // Format data for the chart - use available data or fallback values
  const formattedData = data ? [
    { area: "Driving", value: data.driving },
    { area: "Iron Play", value: data.ironPlay },
    { area: "Chipping", value: data.chipping },
    { area: "Bunker", value: data.bunker },
    { area: "Putting", value: data.putting },
  ] : [
    { area: "Driving", value: 60 },
    { area: "Iron Play", value: 45 },
    { area: "Chipping", value: 70 },
    { area: "Bunker", value: 40 },
    { area: "Putting", value: 65 },
  ];

  // Determine if we're using placeholder data based on explicit props flag
  const usingPlaceholderData = isPlaceholder || !data;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-xl">Performance Analysis</CardTitle>
          <Badge variant="outline" className="w-fit">Last Updated: Today</Badge>
        </div>
        <CardDescription>
          AI-powered analysis of your strengths and weaknesses
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {usingPlaceholderData && (
          <Alert variant="warning" className="bg-amber-500/10 border border-amber-500/20 mb-4">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs text-amber-500">
              Using sample data. Play more rounds to see your actual performance analysis.
            </AlertDescription>
          </Alert>
        )}
        <div className="h-[300px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "65%" : "80%"} data={formattedData}>
              <PolarGrid stroke="#666" />
              <PolarAngleAxis
                dataKey="area"
                tick={{ fill: '#888', fontSize: isMobile ? 10 : 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: '#888', fontSize: isMobile ? 10 : 12 }}
              />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#1E5631"
                fill="#1E5631"
                fillOpacity={0.5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(24, 24, 27, 0.9)',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  fontSize: isMobile ? '12px' : '14px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
