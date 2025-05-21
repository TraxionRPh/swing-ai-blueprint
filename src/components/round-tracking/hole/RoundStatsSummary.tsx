
import { Card } from "@/components/ui/card";

interface RoundStatsSummaryProps {
  totalStrokes: number;
  totalPutts: number;
  fairwaysHit: number;
  totalFairways: number;
  greensInRegulation: number;
  totalGreens: number;
}

export const RoundStatsSummary = ({
  totalStrokes,
  totalPutts,
  fairwaysHit,
  totalFairways,
  greensInRegulation,
  totalGreens
}: RoundStatsSummaryProps) => {
  // Format the fairway and green stats
  const fairwayText = `${fairwaysHit}/${totalFairways}`;
  const girText = `${greensInRegulation}/${totalGreens}`;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Total Strokes" value={totalStrokes.toString()} />
      <StatCard title="Total Putts" value={totalPutts.toString()} />
      <StatCard title="FIR" value={fairwayText} />
      <StatCard title="GIR" value={girText} />
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: string }) => {
  return (
    <Card className="p-4 flex flex-col items-center justify-center">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
};
