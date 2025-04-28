
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ScoringBreakdown = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Scoring Breakdown</CardTitle>
        <CardDescription>Last 5 rounds performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TooltipProvider>
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger className="w-full">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Fairways Hit</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#10B981]">64%</span>
                    <span className="text-xs text-muted-foreground">(+2%)</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Good: Above 60% | Average: 40-60% | Poor: Below 40%</p>
              </TooltipContent>
            </Tooltip>
            <div className="h-2 bg-muted rounded-full">
              <div className="h-2 bg-[#10B981] rounded-full" style={{ width: '64%' }} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger className="w-full">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Greens in Regulation</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#FFC300]">48%</span>
                    <span className="text-xs text-muted-foreground">(+5%)</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Good: Above 60% | Average: 40-60% | Poor: Below 40%</p>
              </TooltipContent>
            </Tooltip>
            <div className="h-2 bg-muted rounded-full">
              <div className="h-2 bg-[#FFC300] rounded-full" style={{ width: '48%' }} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger className="w-full">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Putts per Round</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#10B981]">31.4</span>
                    <span className="text-xs text-muted-foreground">(-0.6)</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Good: Below 32 | Average: 32-36 | Poor: Above 36</p>
              </TooltipContent>
            </Tooltip>
            <div className="h-2 bg-muted rounded-full">
              <div className="h-2 bg-[#10B981] rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
