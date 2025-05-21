
import { Card, CardContent } from "@/components/ui/card";

interface RoundStatsProps {
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
}: RoundStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <h3 className="text-sm font-medium mb-1">Total Strokes</h3>
          <p className="text-2xl font-bold">{totalStrokes || 0}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <h3 className="text-sm font-medium mb-1">Total Putts</h3>
          <p className="text-2xl font-bold">{totalPutts || 0}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <h3 className="text-sm font-medium mb-1">FIR</h3>
          <p className="text-2xl font-bold">{fairwaysHit || 0}/{totalFairways}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <h3 className="text-sm font-medium mb-1">GIR</h3>
          <p className="text-2xl font-bold">{greensInRegulation || 0}/{totalGreens}</p>
        </CardContent>
      </Card>
    </div>
  );
};
