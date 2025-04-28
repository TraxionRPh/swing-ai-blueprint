
import { Card, CardContent } from "@/components/ui/card";

interface ScoreChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const ScoreChartTooltip = ({ active, payload, label }: ScoreChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  const dataPoint = payload[0].payload;
  const overUnder = dataPoint.score - dataPoint.totalPar;
  const overUnderText = overUnder === 0 ? 'E' : overUnder > 0 ? `+${overUnder}` : overUnder;

  return (
    <Card className="bg-card border-primary/20 shadow-lg">
      <CardContent className="p-3 space-y-2">
        <div className="text-sm font-medium text-foreground">
          {dataPoint.courseName}
        </div>
        <div className="text-xs text-muted-foreground">
          {dataPoint.location}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary">{dataPoint.score}</span>
          <span className="text-sm text-muted-foreground">({overUnderText})</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {dataPoint.date}
        </div>
      </CardContent>
    </Card>
  );
};
