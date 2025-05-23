
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useScoringBreakdown } from "@/hooks/useScoringBreakdown";

export const ScoringBreakdown = () => {
  const { metrics, isLoading, error, isUsingFallbackData } = useScoringBreakdown();

  const getColorClass = (isGood: boolean) => {
    return isGood ? "text-[#10B981]" : "text-[#FFC300]";
  };

  const getBarColorClass = (isGood: boolean) => {
    return isGood ? "bg-[#10B981]" : "bg-[#FFC300]";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Scoring Breakdown</CardTitle>
        <CardDescription>Last 5 rounds performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {isUsingFallbackData && (
              <Alert variant="warning" className="bg-amber-500/10 border border-amber-500/20 mb-4">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-xs text-amber-500">
                  Not enough round data to calculate actual stats. Play more rounds to see your real performance.
                </AlertDescription>
              </Alert>
            )}
            
            <TooltipProvider>
              {metrics.map((metric, index) => (
                <div key={index} className="space-y-2 mb-4">
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getColorClass(metric.isGood)}`}>
                            {metric.value}{metric.name.includes("Putts") ? "" : "%"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({metric.change > 0 ? "+" : ""}{metric.change}{metric.name.includes("Putts") ? "" : "%"})
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {metric.name === "Average Putts per Round" ? (
                        <p>Good: Below 32 | Average: 32-36 | Poor: Above 36</p>
                      ) : (
                        <p>Good: Above 60% | Average: 40-60% | Poor: Below 40%</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                  <div className="h-2 bg-muted rounded-full">
                    <div 
                      className={`h-2 ${getBarColorClass(metric.isGood)} rounded-full`} 
                      style={{ 
                        width: metric.name.includes("Putts") 
                          ? `${100 - (((metric.value - 25) / 15) * 100)}%`  // Different calculation for putts (lower is better)
                          : `${metric.value}%` 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </>
        )}
      </CardContent>
    </Card>
  );
};
