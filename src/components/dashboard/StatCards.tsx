// src/components/dashboard/StatCards.tsx
import React from "react";
import { View, Text } from "react-native";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGolfStats } from "@/hooks/useGolfStats";
import { Skeleton } from "@/components/ui/skeleton";

export const StatCards = () => {
  const { handicap, bestRound, practiceTime, loading } = useGolfStats();

  if (loading) {
    return (
      <View className="flex-row flex-wrap gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full md:w-[32%]">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-16" />
            </CardContent>
          </Card>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-4">
      {/* Handicap Card */}
      <Card className="w-full md:w-[32%]">
        <CardHeader className="pb-2">
          <CardTitle>Handicap</CardTitle>
          <CardDescription>Current handicap index</CardDescription>
        </CardHeader>
        <CardContent>
          <Text className="text-4xl font-bold text-[#10B981]">
            {handicap !== undefined ? handicap.toFixed(1) : "N/A"}
          </Text>
        </CardContent>
      </Card>

      {/* Best Round Card */}
      <Card className="w-full md:w-[32%]">
        <CardHeader className="pb-2">
          <CardTitle>Best Round</CardTitle>
          <CardDescription>Your lowest 18-hole round in past 90 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Text className="text-4xl font-bold text-[#10B981]">
            {bestRound ?? "N/A"}
          </Text>
        </CardContent>
      </Card>

      {/* Practice Time Card */}
      <Card className="w-full md:w-[32%]">
        <CardHeader className="pb-2">
          <CardTitle>Practice Time</CardTitle>
          <CardDescription>Hours practiced this month</CardDescription>
        </CardHeader>
        <CardContent>
          <Text className="text-4xl font-bold text-primary">
            {practiceTime}
          </Text>
        </CardContent>
      </Card>
    </View>
  );
};
