
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const PerformanceInsights = () => {
  return (
    <Card className="border border-transparent bg-gradient-to-r p-[1px] from-[#9b87f5] to-[#D946EF]">
      <div className="bg-card h-full rounded-lg">
        <CardHeader className="pb-2 text-foreground rounded-t-lg border-b border-purple-500/20">
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Analysis based on recent rounds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="p-4 bg-muted/20 rounded-lg border border-[#10B981]/20">
            <h4 className="font-medium mb-2 text-[#10B981]">Strong Performance Areas</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Consistent improvement in fairway accuracy (+2% over last 5 rounds)</li>
              <li>• Significant progress in GIR percentage (+5% improvement)</li>
            </ul>
          </div>
          
          <div className="p-4 bg-muted/20 rounded-lg border border-[#FFC300]/20">
            <h4 className="font-medium mb-2 text-[#FFC300]">Areas for Focus</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Average of 1.8 three-putts per round</li>
              <li>• Sand save percentage below target (current: 35%)</li>
            </ul>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
