// src/components/dashboard/ScoringBreakdown.tsx
import React from "react";
import { View, Text } from "react-native";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react-native";
import { useScoringBreakdown } from "@/hooks/useScoringBreakdown";

export const ScoringBreakdown = () => {
  const { metrics, isLoading, error, isUsingFallbackData } =
    useScoringBreakdown();

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
          <View className="flex-row justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </View>
        ) : (
          <>
            {isUsingFallbackData && (
              <Alert
                variant="warning"
                className="bg-amber-500/10 border border-amber-500/20 mb-4"
              >
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-xs text-amber-500">
                  Not enough round data to calculate actual stats. Play more
                  rounds to see your real performance.
                </AlertDescription>
              </Alert>
            )}

            <TooltipProvider>
              {metrics.map((metric, index) => (
                <View key={index} className="space-y-2 mb-4">
                  <Tooltip>
                    <TooltipTrigger className="w-full">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-medium">
                          {metric.name}
                        </Text>

                        <View className="flex-row items-center gap-2">
                          <Text
                            className={`text-2xl font-bold ${getColorClass(
                              metric.isGood
                            )}`}
                          >
                            {metric.value}
                            {metric.name.includes("Putts") ? "" : "%"}
                          </Text>
                          <Text className="text-xs text-muted-foreground">
                            (
                            {metric.change > 0 ? "+" : ""}
                            {metric.change}
                            {metric.name.includes("Putts") ? "" : "%"})
                          </Text>
                        </View>
                      </View>
                    </TooltipTrigger>

                    <TooltipContent>
                      {metric.name === "Average Putts per Round" ? (
                        <Text>
                          Good: Below 32 | Average: 32-36 | Poor: Above 36
                        </Text>
                      ) : (
                        <Text>
                          Good: Above 60% | Average: 40-60% | Poor: Below 40%
                        </Text>
                      )}
                    </TooltipContent>
                  </Tooltip>

                  <View className="h-2 bg-muted rounded-full">
                    <View
                      className={`${getBarColorClass(metric.isGood)} h-2 rounded-full`}
                      style={{
                        width: metric.name.includes("Putts")
                          ? `${100 - (((metric.value - 25) / 15) * 100)}%`
                          : `${metric.value}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </TooltipProvider>
          </>
        )}
      </CardContent>
    </Card>
  );
};
