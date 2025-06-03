// src/components/RecommendedDrillsSection.tsx
import React, { memo } from "react";
import { View, Text } from "react-native";
import { Drill } from "@/types/drill";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { AlertCircle, MoveDown } from "lucide-react-native";
import { DrillCarousel } from "./DrillCarousel";

interface RecommendedDrillsSectionProps {
  drills: Drill[];
  searchAnalysis: string;
}

export const RecommendedDrillsSection = memo(
  ({ drills, searchAnalysis }: RecommendedDrillsSectionProps) => {
    if (!drills.length) return null;

    // Extract key points from the analysis for better presentation
    const analysisPoints = searchAnalysis
      .split(/\n+/)
      .filter((point) => point.trim().length > 0)
      .map((point) => point.trim());

    return (
      <View className="my-8">
        <View className="mb-6">
          <Text className="text-2xl font-semibold mb-4">
            Recommended Drills for Your Issue
          </Text>

          {searchAnalysis && (
            <Alert className="bg-gradient-to-r from-[#9b87f5]/10 to-[#D946EF]/10 border-[#9b87f5]/20 mb-6">
              <AlertCircle className="h-5 w-5 text-[#9b87f5]" />
              <AlertTitle className="text-[#9b87f5] font-semibold text-lg mb-2">
                Coach's Analysis
              </AlertTitle>
              <AlertDescription className="text-foreground/90 leading-relaxed">
                {analysisPoints.length > 1 ? (
                  <View className="space-y-2 mt-2">
                    {analysisPoints.map((point, index) => (
                      <Text key={index} className="pl-6 text-sm text-foreground/90">
                        {point}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text className="text-sm text-foreground/90">{searchAnalysis}</Text>
                )}
              </AlertDescription>
            </Alert>
          )}

          <View className="flex-row items-center gap-2 mb-4">
            <MoveDown className="h-4 w-4 text-muted-foreground" />
            <Text className="text-sm text-muted-foreground">
              Swipe through these personalized recommendations or create a complete practice plan
            </Text>
          </View>
        </View>

        <DrillCarousel drills={drills} />
      </View>
    );
  }
);

RecommendedDrillsSection.displayName = "RecommendedDrillsSection";
