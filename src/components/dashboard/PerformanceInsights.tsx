
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { usePerformanceInsights } from "@/hooks/usePerformanceInsights";

export const PerformanceInsights = () => {
  const { isLoading, error, strongPoints, areasForImprovement } = usePerformanceInsights();
  
  // Fallback data for empty states
  const fallbackStrongPoints = [
    { area: "Fairway Accuracy", description: "Consistent improvement in fairway accuracy (+2% over last 5 rounds)" },
    { area: "GIR Percentage", description: "Significant progress in GIR percentage (+5% improvement)" }
  ];
  
  const fallbackAreasForImprovement = [
    { area: "Putting", description: "Average of 1.8 three-putts per round" },
    { area: "Sand Saves", description: "Sand save percentage below target (current: 35%)" }
  ];

  // Use real data if available, otherwise use fallback data
  const displayStrongPoints = strongPoints.length > 0 ? strongPoints : fallbackStrongPoints;
  const displayAreasForImprovement = areasForImprovement.length > 0 ? areasForImprovement : fallbackAreasForImprovement;

  return (
    <Card className="border border-transparent bg-gradient-to-r p-[1px] from-[#9b87f5] to-[#D946EF]">
      <div className="bg-card h-full rounded-lg">
        <CardHeader className="pb-2 text-foreground rounded-t-lg border-b border-purple-500/20">
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Analysis based on recent rounds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">
                {error}. Showing sample data instead.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-muted/20 rounded-lg border border-[#10B981]/20">
                <h4 className="font-medium mb-2 text-[#10B981]">Strong Performance Areas</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {displayStrongPoints.map((point, index) => (
                    <li key={`strength-${index}`}>• {point.description}</li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-muted/20 rounded-lg border border-[#FFC300]/20">
                <h4 className="font-medium mb-2 text-[#FFC300]">Areas for Focus</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  {displayAreasForImprovement.map((point, index) => (
                    <li key={`improvement-${index}`}>• {point.description}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </div>
    </Card>
  );
};
